<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Services;

use App\Models\User;
use App\Modules\Profiles\DTO\UpdateProfileData;
use App\Modules\Profiles\Models\Profile;
use App\Modules\Profiles\Models\University;

class ProfileService
{
    public function getForUser(User $user): Profile
    {
        return $this->load($this->ensureForUser($user));
    }

    public function currentUniversity(User $user): ?University
    {
        return $this->getForUser($user)->university;
    }

    public function ensureForUser(User $user): Profile
    {
        $profile = Profile::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['profile_image' => $user->avatar_path],
        );

        if ($profile->profile_image === null && $user->avatar_path !== null) {
            $profile->forceFill([
                'profile_image' => $user->avatar_path,
            ])->save();
        }

        return $profile;
    }

    public function update(User $user, UpdateProfileData $data): Profile
    {
        $profile = $this->ensureForUser($user);

        $profile->fill([
            'bio' => $data->bio,
            'phone' => $data->phone,
            'telegram' => $this->normalizeTelegram($data->telegram),
            'city' => $data->city,
            'birth_date' => $data->birthDate,
        ]);

        $profile->save();

        return $this->load($profile);
    }

    public function attachUniversity(User $user, University $university): Profile
    {
        $profile = $this->ensureForUser($user);

        $profile->university()->associate($university);
        $profile->save();

        return $this->load($profile);
    }

    public function detachUniversity(User $user): Profile
    {
        $profile = $this->ensureForUser($user);
        $university = $profile->university;

        $profile->forceFill([
            'university_id' => null,
        ])->save();

        if ($university !== null && (string) $university->user_id === (string) $user->id) {
            $university->delete();
        }

        return $this->load($profile->fresh());
    }

    private function load(Profile $profile): Profile
    {
        return $profile->loadMissing(['user', 'university']);
    }

    private function normalizeTelegram(?string $telegram): ?string
    {
        if ($telegram === null) {
            return null;
        }

        return ltrim($telegram, '@');
    }
}
