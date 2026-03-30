<?php

namespace App\Modules\Groups\Http\Controllers;

use App\Core\Response\ApiResponse;
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

        return ApiResponse::created('Member added.', new GroupMemberResource($member));
    }

    public function update(
        Group $group,
        GroupMember $member,
        UpdateGroupMemberRequest $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'invite');
        abort_unless($member->group_id === $group->id, 404);

        $member->update($request->validated());
        $member->load(['user', 'inviter']);

        return ApiResponse::ok('Member updated.', new GroupMemberResource($member));
    }

    public function destroy(
        Group $group,
        GroupMember $member,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'invite');
        abort_unless($member->group_id === $group->id, 404);

        $member->delete();

        return ApiResponse::ok('Member removed.');
    }

    public function leave(Group $group, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $membership = $permissions->requireActiveMembership($request->user(), $group);

        $membership->update([
            'status' => 'left',
            'left_at' => now(),
        ]);

        return ApiResponse::ok('You left the group.', new GroupMemberResource($membership->fresh(['user'])));
    }
}
