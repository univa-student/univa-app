<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Modules\Auth\Services\SessionMetadataService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class SessionController extends Controller
{
    public function __construct(
        private readonly SessionMetadataService $sessionMetadataService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $currentSessionId = $this->resolveCurrentSessionId($request);
        $sessions = match ((string) config('session.driver', 'database')) {
            'file' => $this->listFileSessions($request, $currentSessionId),
            default => $this->listDatabaseSessions($request, $currentSessionId),
        };

        return ApiResponse::data($sessions);
    }

    public function destroy(Request $request, string $sessionId): JsonResponse
    {
        $currentSessionId = $this->resolveCurrentSessionId($request);

        if ($currentSessionId !== '' && hash_equals($currentSessionId, $sessionId)) {
            return ApiResponse::error(
                state: ResponseState::Unprocessable,
                message: __('You cannot terminate the current session here.'),
            );
        }

        $deleted = match ((string) config('session.driver', 'database')) {
            'file' => $this->deleteFileSession($request, $sessionId),
            default => $this->deleteDatabaseSession($request, $sessionId),
        };

        if ($deleted === 0) {
            return ApiResponse::error(
                state: ResponseState::NotFound,
                message: __('Session not found.'),
            );
        }

        return ApiResponse::ok(
            message: __('Session terminated.'),
        );
    }

    private function resolveCurrentSessionId(Request $request): string
    {
        if (! $request->hasSession()) {
            return '';
        }

        $sessionId = $request->session()->getId();

        return is_string($sessionId) ? $sessionId : '';
    }

    /**
     * @return array<int, array{id: string, ipAddress: ?string, userAgent: ?string, lastActiveAt: string, current: bool}>
     */
    private function listDatabaseSessions(Request $request, string $currentSessionId): array
    {
        $minLastActivity = now()
            ->subMinutes((int) config('session.lifetime', 120))
            ->getTimestamp();

        return DB::table((string) config('session.table', 'sessions'))
            ->select(['id', 'ip_address', 'user_agent', 'last_activity'])
            ->where('user_id', $request->user()->id)
            ->where('last_activity', '>=', $minLastActivity)
            ->orderByDesc('last_activity')
            ->get()
            ->map(fn (object $session): array => $this->formatSession(
                sessionId: (string) $session->id,
                lastActivity: CarbonImmutable::createFromTimestamp((int) $session->last_activity),
                currentSessionId: $currentSessionId,
                ipAddress: $session->ip_address,
                userAgent: $session->user_agent,
            ))
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{id: string, ipAddress: ?string, userAgent: ?string, lastActiveAt: string, current: bool}>
     */
    private function listFileSessions(Request $request, string $currentSessionId): array
    {
        $sessionPath = (string) config('session.files', storage_path('framework/sessions'));

        if (! File::isDirectory($sessionPath)) {
            return [];
        }

        $minLastActivity = now()->subMinutes((int) config('session.lifetime', 120));

        return collect(File::files($sessionPath))
            ->map(function (\SplFileInfo $file) use ($request, $currentSessionId, $minLastActivity): ?array {
                $lastActivity = CarbonImmutable::createFromTimestamp($file->getMTime());

                if ($lastActivity->lt($minLastActivity)) {
                    return null;
                }

                $payload = $this->decodeFileSession($file->getRealPath());

                if (! is_array($payload) || ! $this->sessionPayloadBelongsToUser($payload, (int) $request->user()->id)) {
                    return null;
                }

                $metadata = $this->sessionMetadataService->readFromPayload($payload);

                if ($file->getFilename() === $currentSessionId) {
                    $metadata = [
                        'ipAddress' => $request->ip(),
                        'userAgent' => $request->userAgent(),
                    ];
                }

                return $this->formatSession(
                    sessionId: $file->getFilename(),
                    lastActivity: $lastActivity,
                    currentSessionId: $currentSessionId,
                    ipAddress: $metadata['ipAddress'],
                    userAgent: $metadata['userAgent'],
                );
            })
            ->filter()
            ->sortByDesc('lastActiveAt')
            ->values()
            ->all();
    }

    private function deleteDatabaseSession(Request $request, string $sessionId): int
    {
        return DB::table((string) config('session.table', 'sessions'))
            ->where('user_id', $request->user()->id)
            ->where('id', $sessionId)
            ->delete();
    }

    private function deleteFileSession(Request $request, string $sessionId): int
    {
        $path = $this->resolveFileSessionPath($sessionId);

        if ($path === null) {
            return 0;
        }

        $payload = $this->decodeFileSession($path);

        if (! is_array($payload) || ! $this->sessionPayloadBelongsToUser($payload, (int) $request->user()->id)) {
            return 0;
        }

        return File::delete($path) ? 1 : 0;
    }

    private function resolveFileSessionPath(string $sessionId): ?string
    {
        $sessionPath = (string) config('session.files', storage_path('framework/sessions'));
        $path = $sessionPath.DIRECTORY_SEPARATOR.basename($sessionId);

        return File::exists($path) ? $path : null;
    }

    private function decodeFileSession(string $path): ?array
    {
        $contents = File::get($path);
        $payload = @unserialize($contents, ['allowed_classes' => false]);

        return is_array($payload) ? $payload : null;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function sessionPayloadBelongsToUser(array $payload, int $userId): bool
    {
        $authKey = Auth::guard('web')->getName();

        return isset($payload[$authKey]) && (string) $payload[$authKey] === (string) $userId;
    }

    private function formatSession(
        string $sessionId,
        CarbonImmutable $lastActivity,
        string $currentSessionId,
        ?string $ipAddress,
        ?string $userAgent,
    ): array {
        return [
            'id' => $sessionId,
            'ipAddress' => $ipAddress,
            'userAgent' => $userAgent,
            'lastActiveAt' => $lastActivity->toIso8601String(),
            'current' => $currentSessionId !== '' && hash_equals($currentSessionId, $sessionId),
        ];
    }
}
