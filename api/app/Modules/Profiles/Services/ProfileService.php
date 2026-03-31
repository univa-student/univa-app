<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Services;

use App\Core\UnivaHttpException;
use App\Models\User;
use App\Modules\Profiles\DTO\UpdateProfileData;
use App\Modules\Profiles\Models\Profile;
use App\Modules\Profiles\Models\University;

readonly class ProfileService
{
    public function __construct(
        private ProfilePrivacyService $profilePrivacyService,
    ) {}

    public function getForUser(User $user): Profile
    {
        return $this->decorate(
            profile: $this->load($this->ensureForUser($user)),
            owner: $user,
            viewer: $user,
        );
    }

    /**
     * @throws UnivaHttpException
     */
    public function publicForUser(User $user, ?User $viewer = null): Profile
    {
        $this->profilePrivacyService->ensureCanViewProfile($user, $viewer);

        $profile = $user->profile()->with('university')->first();

        if ($profile !== null) {
            return $this->decorate(
                profile: $this->load($profile),
                owner: $user,
                viewer: $viewer,
            );
        }

        $profile = new Profile([
            'user_id' => $user->id,
            'profile_image' => $user->avatar_path,
        ]);

        $profile->setRelation('user', $user);
        $profile->setRelation('university', null);

        return $this->decorate(
            profile: $profile,
            owner: $user,
            viewer: $viewer,
        );
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

        return $this->decorate(
            profile: $this->load($profile),
            owner: $user,
            viewer: $user,
        );
    }

    public function attachUniversity(User $user, University $university): Profile
    {
        $profile = $this->ensureForUser($user);

        $profile->university()->associate($university);
        $profile->save();

        return $this->decorate(
            profile: $this->load($profile),
            owner: $user,
            viewer: $user,
        );
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

        return $this->decorate(
            profile: $this->load($profile->fresh()),
            owner: $user,
            viewer: $user,
        );
    }

    private function load(Profile $profile): Profile
    {
        return $profile->loadMissing(['user', 'university']);
    }

    private function decorate(Profile $profile, User $owner, ?User $viewer): Profile
    {
        $profile->setAttribute(
            'online_status',
            $this->profilePrivacyService->resolveOnlineStatus($owner, $viewer),
        );

        return $profile;
    }

    private function normalizeTelegram(?string $telegram): ?string
    {
        if ($telegram === null) {
            return null;
        }

        return ltrim($telegram, '@');
    }
}
