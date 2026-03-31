<?php

namespace App\Modules\Groups\UseCases;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Models\User;
use App\Modules\Groups\Enums\GroupInviteStatus;
use App\Modules\Groups\Enums\GroupMemberStatus;
use App\Modules\Groups\Enums\GroupRole;
use App\Modules\Groups\Models\GroupInvite;
use App\Modules\Groups\Models\GroupMember;
use Illuminate\Support\Facades\DB;

class JoinGroupByInvite
{
    public function handle(User $user, string $identifier): GroupMember
    {
        $invite = GroupInvite::query()
            ->where('token', $identifier)
            ->orWhere('code', $identifier)
            ->with('group')
            ->first();

        if ($invite === null || ! $invite->isUsable()) {
            throw new UnivaHttpException('Запрошення недійсне або його термін дії минув.', ResponseState::Unprocessable);
        }

        return DB::transaction(function () use ($user, $invite): GroupMember {
            $membership = GroupMember::query()->updateOrCreate(
                [
                    'group_id' => $invite->group_id,
                    'user_id' => $user->id,
                ],
                [
                    'role' => GroupRole::Student,
                    'status' => GroupMemberStatus::Active,
                    'joined_at' => now(),
                    'left_at' => null,
                ]
            );

            $invite->increment('uses_count');

            if ($invite->max_uses !== null && $invite->uses_count >= $invite->max_uses) {
                $invite->status = GroupInviteStatus::Revoked;
                $invite->save();
            }

            return $membership->fresh(['group', 'user']);
        });
    }
}
