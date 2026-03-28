<?php

declare(strict_types=1);

namespace App\Modules\Profiles\UseCases;

use App\Models\User;
use App\Modules\Profiles\Models\Profile;
use App\Modules\Profiles\Services\ProfileService;

readonly class InitializeProfile
{
    public function __construct(
        private ProfileService $profiles,
    ) {}

    public function handle(User $user): Profile
    {
        return $this->profiles->getForUser($user);
    }
}
