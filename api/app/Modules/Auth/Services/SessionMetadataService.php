<?php

namespace App\Modules\Auth\Services;

use Illuminate\Http\Request;

class SessionMetadataService
{
    public const string IP_ADDRESS_KEY = 'auth_session_ip_address';
    public const string USER_AGENT_KEY = 'auth_session_user_agent';

    public function sync(Request $request): void
    {
        if (! $request->hasSession() || ! $request->user()) {
            return;
        }

        $request->session()->put(self::IP_ADDRESS_KEY, $this->normalizeNullableString($request->ip()));
        $request->session()->put(self::USER_AGENT_KEY, $this->normalizeNullableString($request->userAgent()));
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{ipAddress: ?string, userAgent: ?string}
     */
    public function readFromPayload(array $payload): array
    {
        return [
            'ipAddress' => $this->normalizeNullableString($payload[self::IP_ADDRESS_KEY] ?? null),
            'userAgent' => $this->normalizeNullableString($payload[self::USER_AGENT_KEY] ?? null),
        ];
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed !== '' ? $trimmed : null;
    }
}
