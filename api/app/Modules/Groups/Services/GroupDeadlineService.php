<?php

namespace App\Modules\Groups\Services;

use App\Models\User;
use App\Modules\Groups\Enums\GroupDeadlineProgressStatus;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupDeadline;
use App\Modules\Groups\Models\GroupDeadlineMemberStatus;
use App\Modules\Groups\Models\GroupMember;

class GroupDeadlineService
{
    public function create(Group $group, User $user, array $data): GroupDeadline
    {
        $deadline = GroupDeadline::query()->create(array_merge($data, [
            'group_id' => $group->id,
            'created_by' => $user->id,
        ]));

        $members = $group->members()->where('status', 'active')->get();
        foreach ($members as $member) {
            GroupDeadlineMemberStatus::query()->create([
                'group_deadline_id' => $deadline->id,
                'user_id' => $member->user_id,
                'status' => GroupDeadlineProgressStatus::NotStarted,
            ]);
        }

        return $deadline->fresh(['subject', 'memberStatuses']);
    }

    public function update(GroupDeadline $deadline, array $data): GroupDeadline
    {
        $deadline->update($data);

        return $deadline->fresh(['subject', 'memberStatuses']);
    }

    public function updateProgress(GroupDeadline $deadline, GroupMember $member, string $status): GroupDeadlineMemberStatus
    {
        $row = GroupDeadlineMemberStatus::query()->firstOrCreate(
            [
                'group_deadline_id' => $deadline->id,
                'user_id' => $member->user_id,
            ],
            [
                'status' => GroupDeadlineProgressStatus::NotStarted,
            ],
        );

        $row->status = GroupDeadlineProgressStatus::from($status);
        $row->completed_at = $row->status === GroupDeadlineProgressStatus::Completed ? now() : null;
        $row->save();

        return $row->fresh();
    }
}
