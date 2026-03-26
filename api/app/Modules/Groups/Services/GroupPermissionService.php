<?php

namespace App\Modules\Groups\Services;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Models\User;
use App\Modules\Groups\Enums\GroupMemberStatus;
use App\Modules\Groups\Enums\GroupRole;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupMember;

class GroupPermissionService
{
    public function membership(User|int $user, Group|int $group): ?GroupMember
    {
        $userId = $user instanceof User ? $user->id : $user;
        $groupId = $group instanceof Group ? $group->id : $group;

        return GroupMember::query()
            ->where('group_id', $groupId)
            ->where('user_id', $userId)
            ->first();
    }

    public function requireActiveMembership(User|int $user, Group|int $group): GroupMember
    {
        $membership = $this->membership($user, $group);

        if ($membership === null || $membership->status !== GroupMemberStatus::Active) {
            throw new UnivaHttpException('You do not have access to this group.', ResponseState::Forbidden, 403);
        }

        return $membership;
    }

    public function can(User|int $user, Group $group, string $ability): bool
    {
        $membership = $this->membership($user, $group);

        if ($membership === null || $membership->status !== GroupMemberStatus::Active) {
            return false;
        }

        $required = GroupRole::from($group->{$ability.'_role'});

        return $membership->role->allows($required);
    }

    public function authorize(User|int $user, Group $group, string $ability): void
    {
        if (! $this->can($user, $group, $ability)) {
            throw new UnivaHttpException('You do not have permission to perform this action.', ResponseState::Forbidden, 403);
        }
    }
}
