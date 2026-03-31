<?php

declare(strict_types=1);

namespace App\Modules\User\Http\Resources;

use App\Modules\Profiles\Services\ProfilePrivacyService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class FriendCardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $profile = $this->resource->profile;
        $canViewProfile = app(ProfilePrivacyService::class)->canViewProfile(
            owner: $this->resource,
            viewer: $request->user(),
        );

        return [
            'id' => $this->resource->id,
            'first_name' => $this->resource->first_name,
            'last_name' => $this->resource->last_name,
            'username' => $this->resource->username,
            'avatar_path' => $this->resource->avatar_path
                ? url(Storage::url($this->resource->avatar_path))
                : null,
            'friendship_status' => $this->resource->friendship_status,
            'profile' => [
                'city' => $canViewProfile ? $profile?->city : null,
                'telegram' => $canViewProfile && $profile?->telegram !== null
                    ? '@'.ltrim($profile->telegram, '@')
                    : null,
                'phone' => $canViewProfile ? $profile?->phone : null,
            ],
        ];
    }
}
