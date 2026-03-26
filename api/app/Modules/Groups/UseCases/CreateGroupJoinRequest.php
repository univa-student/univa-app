<?php

namespace App\Modules\Groups\UseCases;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Models\User;
use App\Modules\Groups\Enums\GroupJoinRequestStatus;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupJoinRequest;

class CreateGroupJoinRequest
{
    public function handle(User $user, Group $group, array $data): GroupJoinRequest
    {
        if ($group->join_policy === 'invite_only') {
            throw new UnivaHttpException('This group accepts members by invite only.', ResponseState::Forbidden, 403);
        }

        return GroupJoinRequest::query()->updateOrCreate(
            [
                'group_id' => $group->id,
                'user_id' => $user->id,
            ],
            [
                'message' => $data['message'] ?? null,
                'status' => GroupJoinRequestStatus::Pending,
                'reviewed_by' => null,
                'reviewed_at' => null,
            ]
        );
    }
}
