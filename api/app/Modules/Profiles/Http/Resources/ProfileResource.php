<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Http\Resources;

use App\Modules\Auth\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $filledFields = collect([
            $this->bio,
            $this->phone,
            $this->telegram,
            $this->city,
            $this->birth_date,
            $this->university_id,
        ])->filter(static fn (mixed $value): bool => filled($value))->count();

        $totalFields = 6;

        return [
            'id' => $this->id,
            'profile_image' => $this->profile_image,
            'bio' => $this->bio,
            'phone' => $this->phone,
            'telegram' => $this->telegram !== null ? '@'.ltrim($this->telegram, '@') : null,
            'city' => $this->city,
            'birth_date' => $this->birth_date?->toDateString(),
            'online_status' => $this->online_status,
            'user' => UserResource::make($this->whenLoaded('user')),
            'university' => UniversityResource::make($this->whenLoaded('university')),
            'completion' => [
                'filled' => $filledFields,
                'total' => $totalFields,
                'percent' => (int) round(($filledFields / $totalFields) * 100),
            ],
        ];
    }
}
