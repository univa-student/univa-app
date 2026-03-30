<?php

namespace App\Modules\Groups\UseCases;

use App\Models\User;
use App\Modules\Files\Models\Folder;
use App\Modules\Groups\Enums\GroupChannelType;
use App\Modules\Groups\Enums\GroupMemberStatus;
use App\Modules\Groups\Enums\GroupRole;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupChannel;
use App\Modules\Groups\Models\GroupMember;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateGroup
{
    public function handle(User $user, array $data): Group
    {
        return DB::transaction(function () use ($user, $data): Group {
            $group = Group::query()->create([
                ...$data,
                'slug' => Str::slug($data['slug'] ?? $data['name']),
                'owner_id' => $user->id,
                'created_by' => $user->id,
            ]);

            GroupMember::query()->create([
                'group_id' => $group->id,
                'user_id' => $user->id,
                'role' => GroupRole::Owner,
                'status' => GroupMemberStatus::Active,
                'joined_at' => now(),
            ]);

            GroupChannel::query()->create([
                'group_id' => $group->id,
                'name' => 'General',
                'slug' => 'general',
                'type' => GroupChannelType::General,
                'is_default' => true,
            ]);

            GroupChannel::query()->create([
                'group_id' => $group->id,
                'name' => 'Announcements',
                'slug' => 'announcements',
                'type' => GroupChannelType::Announcements,
                'is_default' => true,
            ]);

            Folder::query()->firstOrCreate(
                [
                    'group_id' => $group->id,
                    'group_subject_id' => null,
                    'parent_id' => null,
                ],
                [
                    'user_id' => $user->id,
                    'name' => $group->name,
                ]
            );

            return $group->fresh(['owner', 'creator']);
        });
    }
}
