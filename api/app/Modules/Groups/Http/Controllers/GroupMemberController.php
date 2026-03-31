<?php

namespace App\Modules\Groups\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Groups\Http\Requests\StoreGroupMemberRequest;
use App\Modules\Groups\Http\Requests\UpdateGroupMemberRequest;
use App\Modules\Groups\Http\Resources\GroupMemberResource;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupMember;
use App\Modules\Groups\Services\GroupPermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupMemberController extends Controller
{
    /**
     * @throws UnivaHttpException
     */
    public function index(Group $group, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);

        $members = $group->members()
            ->with(['user', 'inviter'])
            ->orderBy('status')
            ->orderBy('role')
            ->get();

        return ApiResponse::data(GroupMemberResource::collection($members));
    }

    /**
     * @throws UnivaHttpException
     */
    public function store(
        Group $group,
        StoreGroupMemberRequest $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'invite');

        $member = GroupMember::query()->updateOrCreate(
            [
                'group_id' => $group->id,
                'user_id' => $request->integer('user_id'),
            ],
            [
                'role' => $request->input('role', 'student'),
                'status' => $request->input('status', 'active'),
                'nickname_in_group' => $request->input('nickname_in_group'),
                'subgroup' => $request->input('subgroup'),
                'invited_by' => $request->user()->id,
                'joined_at' => now(),
                'left_at' => null,
            ]
        );

        $member->load(['user', 'inviter']);

        return ApiResponse::created('Учасника додано.', new GroupMemberResource($member));
    }

    public function update(
        Group $group,
        GroupMember $member,
        UpdateGroupMemberRequest $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'invite');
        if ($member->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }

        $member->update($request->validated());
        $member->load(['user', 'inviter']);

        return ApiResponse::ok('Учасника оновлено.', new GroupMemberResource($member));
    }

    public function destroy(
        Group $group,
        GroupMember $member,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'invite');
        if ($member->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }

        $member->delete();

        return ApiResponse::ok('Учасника видалено.');
    }

    public function leave(Group $group, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $membership = $permissions->requireActiveMembership($request->user(), $group);

        $membership->update([
            'status' => 'left',
            'left_at' => now(),
        ]);

        return ApiResponse::ok('Ви вийшли з групи.', new GroupMemberResource($membership->fresh(['user'])));
    }
}
