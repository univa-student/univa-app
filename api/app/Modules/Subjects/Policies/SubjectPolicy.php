<?php

namespace App\Modules\Subjects\Policies;

use App\Modules\Subjects\Models\Subject;
use App\Models\User;

class SubjectPolicy
{
    public function view(User $user, Subject $subject): bool
    {
        return $user->id === $subject->user_id;
    }

    public function update(User $user, Subject $subject): bool
    {
        return $user->id === $subject->user_id;
    }

    public function delete(User $user, Subject $subject): bool
    {
        return $user->id === $subject->user_id;
    }
}
