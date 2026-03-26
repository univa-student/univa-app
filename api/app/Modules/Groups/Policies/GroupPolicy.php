<?php

namespace App\Modules\Groups\Policies;

use App\Models\User;
use App\Modules\Groups\Enums\GroupMemberStatus;
use App\Modules\Groups\Enums\GroupRole;
use App\Modules\Groups\Models\Group;

class GroupPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Group $group): bool
    {
        if ($group->visibility === 'public') {
            return true;
        }

        return $group->members()
            ->where('user_id', $user->id)
            ->where('status', GroupMemberStatus::Active)
            ->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Group $group): bool
    {
        $membership = $group->members()->where('user_id', $user->id)->first();

        return $membership !== null
            && $membership->status === GroupMemberStatus::Active
            && $membership->role->allows(GroupRole::from($group->edit_role));
    }

    public function delete(User $user, Group $group): bool
    {
        return $group->owner_id === $user->id;
    }
}
