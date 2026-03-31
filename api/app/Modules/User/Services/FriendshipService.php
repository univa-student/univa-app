<?php

declare(strict_types=1);

namespace App\Modules\User\Services;

use App\Models\User;
use App\Modules\User\Enums\FriendshipStatus;
use App\Modules\User\Models\Friendship;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class FriendshipService
{
    public function areFriends(User $firstUser, User $secondUser): bool
    {
        if ((int) $firstUser->id === (int) $secondUser->id) {
            return true;
        }

        return Friendship::query()
            ->where(function ($query) use ($firstUser, $secondUser) {
                $query
                    ->where('status', FriendshipStatus::ACCEPTED)
                    ->where('user_id', $firstUser->id)
                    ->where('friend_id', $secondUser->id);
            })
            ->orWhere(function ($query) use ($firstUser, $secondUser) {
                $query
                    ->where('status', FriendshipStatus::ACCEPTED)
                    ->where('user_id', $secondUser->id)
                    ->where('friend_id', $firstUser->id);
            })
            ->exists();
    }

    public function getFriends(User $user): Collection
    {
        $friendships = Friendship::with(['sender.profile', 'receiver.profile'])
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)->orWhere('friend_id', $user->id);
            })
            ->where('status', FriendshipStatus::ACCEPTED)
            ->get();

        return $friendships
            ->map(function (Friendship $friendship) use ($user) {
                $friend = $friendship->user_id === $user->id
                    ? $friendship->receiver
                    : $friendship->sender;

                return $this->attachStatus($friend, 'accepted');
            })
            ->sortBy(fn (User $friend) => mb_strtolower(trim(sprintf(
                '%s %s',
                $friend->first_name,
                $friend->last_name ?? '',
            ))))
            ->values();
    }

    public function getPendingRequests(User $user): Collection
    {
        return Friendship::with('sender.profile')
            ->where('friend_id', $user->id)
            ->where('status', FriendshipStatus::PENDING)
            ->orderByDesc('created_at')
            ->get();
    }

    public function searchUsers(User $user, string $query): Collection
    {
        $normalizedQuery = mb_strtolower(trim($query));
        $usernameQuery = ltrim($normalizedQuery, '@');
        $searchByUsernameOnly = Str::startsWith($normalizedQuery, '@');
        $usernameLike = '%'.$usernameQuery.'%';
        $usernamePrefix = $usernameQuery.'%';
        $nameLike = '%'.$normalizedQuery.'%';
        $namePrefix = $normalizedQuery.'%';

        $users = User::query()
            ->with('profile')
            ->where('id', '!=', $user->id)
            ->where(function ($builder) use ($usernameLike, $searchByUsernameOnly, $nameLike) {
                $builder->whereRaw('LOWER(username) LIKE ?', [$usernameLike]);

                if ($searchByUsernameOnly) {
                    return;
                }

                $builder
                    ->orWhereRaw('LOWER(first_name) LIKE ?', [$nameLike])
                    ->orWhereRaw('LOWER(COALESCE(last_name, \'\')) LIKE ?', [$nameLike])
                    ->orWhereRaw(
                        "LOWER(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))) LIKE ?",
                        [$nameLike]
                    );
            })
            ->orderByRaw(
                "CASE
                    WHEN LOWER(username) = ? THEN 0
                    WHEN LOWER(username) LIKE ? THEN 1
                    WHEN LOWER(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))) LIKE ? THEN 2
                    WHEN LOWER(first_name) LIKE ? THEN 3
                    WHEN LOWER(COALESCE(last_name, '')) LIKE ? THEN 4
                    ELSE 5
                END",
                [
                    $usernameQuery,
                    $usernamePrefix,
                    $namePrefix,
                    $namePrefix,
                    $namePrefix,
                ]
            )
            ->orderByRaw('LOWER(username) ASC')
            ->limit(20)
            ->get();

        if ($users->isEmpty()) {
            return $users;
        }

        $statuses = $this->getStatusesForUsers($user, $users->pluck('id')->all());

        return $users->map(function (User $candidate) use ($statuses) {
            return $this->attachStatus(
                $candidate,
                $statuses[$candidate->id] ?? 'none',
            );
        });
    }

    public function checkStatus(User $me, int $userId): string
    {
        if ($me->id === $userId) {
            return 'self';
        }

        $friendship = Friendship::where(function ($query) use ($me, $userId) {
            $query->where('user_id', $me->id)->where('friend_id', $userId);
        })->orWhere(function ($query) use ($me, $userId) {
            $query->where('user_id', $userId)->where('friend_id', $me->id);
        })->first();

        if (!$friendship) {
            return 'none';
        }

        if ($friendship->status === FriendshipStatus::ACCEPTED) {
            return 'accepted';
        }

        if ($friendship->user_id === $me->id) {
            return 'pending_sent';
        }

        return 'pending_received';
    }

    private function getStatusesForUsers(User $user, array $userIds): array
    {
        if ($userIds === []) {
            return [];
        }

        $friendships = Friendship::query()
            ->where(function ($query) use ($user, $userIds) {
                $query
                    ->where('user_id', $user->id)
                    ->whereIn('friend_id', $userIds);
            })
            ->orWhere(function ($query) use ($user, $userIds) {
                $query
                    ->whereIn('user_id', $userIds)
                    ->where('friend_id', $user->id);
            })
            ->get();

        $statuses = [];

        foreach ($friendships as $friendship) {
            $otherUserId = $friendship->user_id === $user->id
                ? (int) $friendship->friend_id
                : (int) $friendship->user_id;

            if ($friendship->status === FriendshipStatus::ACCEPTED) {
                $statuses[$otherUserId] = 'accepted';
                continue;
            }

            $statuses[$otherUserId] = $friendship->user_id === $user->id
                ? 'pending_sent'
                : 'pending_received';
        }

        return $statuses;
    }

    private function attachStatus(User $user, string $status): User
    {
        $user->setAttribute('friendship_status', $status);

        return $user;
    }
}
