<?php

namespace App\Modules\Groups\UseCases;

use App\Models\User;
use App\Modules\Groups\Enums\GroupJoinRequestStatus;
use App\Modules\Groups\Enums\GroupMemberStatus;
use App\Modules\Groups\Enums\GroupRole;
use App\Modules\Groups\Models\GroupJoinRequest;
use App\Modules\Groups\Models\GroupMember;
use Illuminate\Support\Facades\DB;

class RespondToGroupJoinRequest
{
    public function handle(User $reviewer, GroupJoinRequest $request, string $decision): GroupJoinRequest
    {
        return DB::transaction(function () use ($reviewer, $request, $decision): GroupJoinRequest {
            $status = GroupJoinRequestStatus::from($decision);

            $request->update([
                'status' => $status,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            if ($status === GroupJoinRequestStatus::Approved) {
                GroupMember::query()->updateOrCreate(
                    [
                        'group_id' => $request->group_id,
                        'user_id' => $request->user_id,
                    ],
                    [
                        'role' => GroupRole::Student,
                        'status' => GroupMemberStatus::Active,
                        'joined_at' => now(),
                        'left_at' => null,
                    ]
                );
            }

            return $request->fresh(['group', 'user', 'reviewer']);
        });
    }
}
