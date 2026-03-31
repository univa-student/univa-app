<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Services;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Models\User;
use App\Modules\Settings\Models\ApplicationSetting;
use App\Modules\Settings\Models\ApplicationSettingValue;
use App\Modules\Settings\Services\SettingsService;
use App\Modules\User\Services\FriendshipService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

readonly class ProfilePrivacyService
{
    public function __construct(
        private SettingsService   $settingsService,
        private FriendshipService $friendshipService,
    ) {}

    /**
     * @throws UnivaHttpException
     */
    public function ensureCanViewProfile(User $owner, ?User $viewer): void
    {
        if ($this->canViewProfile($owner, $viewer)) {
            return;
        }

        $message = $this->resolveProfileVisibility((int) $owner->id) === ApplicationSettingValue::SETTING_PRIVACY_PROFILE_FRIENDS
            ? 'Цей профіль доступний лише друзям.'
            : 'Цей профіль приватний.';

        throw new UnivaHttpException($message, ResponseState::Forbidden);
    }

    public function canViewProfile(User $owner, ?User $viewer): bool
    {
        if ($viewer !== null && (int) $viewer->id === (int) $owner->id) {
            return true;
        }

        return match ($this->resolveProfileVisibility((int) $owner->id)) {
            ApplicationSettingValue::SETTING_PRIVACY_PROFILE_FRIENDS => $viewer !== null
                && $this->friendshipService->areFriends($owner, $viewer),
            ApplicationSettingValue::SETTING_PRIVACY_PROFILE_PRIVATE_VALUE => false,
            default => true,
        };
    }

    public function resolveOnlineStatus(User $owner, ?User $viewer): ?bool
    {
        if ($viewer !== null && (int) $viewer->id === (int) $owner->id) {
            return $this->isOnline($owner);
        }

        if (! $this->canViewProfile($owner, $viewer)) {
            return null;
        }

        $canShowOnline = $this->settingsService->getEffectiveValueByKey(
            userId: (int) $owner->id,
            key: ApplicationSetting::PRIVACY_ONLINE_STATUS_SETTING_KEY,
        ) === (string) ApplicationSettingValue::SETTING_ENABLED_VALUE;

        if (! $canShowOnline) {
            return null;
        }

        return $this->isOnline($owner);
    }

    private function resolveProfileVisibility(int $userId): string
    {
        return $this->settingsService->getEffectiveValueByKey(
            userId: $userId,
            key: ApplicationSetting::PRIVACY_PROFILE_SETTING_KEY,
        ) ?? ApplicationSettingValue::SETTING_PRIVACY_PROFILE_PUBLIC_VALUE;
    }

    private function isOnline(User $user): bool
    {
        $driver = (string) config('session.driver', 'database');
        $minLastActivity = now()
            ->subMinutes((int) config('session.lifetime', 120))
            ->getTimestamp();

        if ($driver === 'file') {
            return $this->hasActiveFileSession($user, $minLastActivity);
        }

        return DB::table((string) config('session.table', 'sessions'))
            ->where('user_id', $user->id)
            ->where('last_activity', '>=', $minLastActivity)
            ->exists();
    }

    private function hasActiveFileSession(User $user, int $minLastActivity): bool
    {
        $sessionPath = (string) config('session.files', storage_path('framework/sessions'));

        if (! File::isDirectory($sessionPath)) {
            return false;
        }

        $authKey = Auth::guard('web')->getName();

        foreach (File::files($sessionPath) as $file) {
            if ($file->getMTime() < $minLastActivity) {
                continue;
            }

            $payload = @unserialize(File::get($file->getRealPath()), ['allowed_classes' => false]);

            if (! is_array($payload)) {
                continue;
            }

            if (isset($payload[$authKey]) && (string) $payload[$authKey] === (string) $user->id) {
                return true;
            }
        }

        return false;
    }
}
