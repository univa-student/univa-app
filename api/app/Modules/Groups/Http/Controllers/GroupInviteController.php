<?php

namespace App\Modules\Groups\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Groups\Http\Requests\JoinGroupInviteRequest;
use App\Modules\Groups\Http\Requests\StoreGroupInviteRequest;
use App\Modules\Groups\Http\Resources\GroupInviteResource;
use App\Modules\Groups\Http\Resources\GroupMemberResource;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupInvite;
use App\Modules\Groups\Services\GroupPermissionService;
use App\Modules\Groups\UseCases\JoinGroupByInvite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GroupInviteController extends Controller
{
    /**
     * @throws UnivaHttpException
     */
    public function index(Group $group, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->authorize($request->user(), $group, 'invite');

        $invites = $group->invites()->with('creator')->latest()->get();

        return ApiResponse::data(GroupInviteResource::collection($invites));
    }

    /**
     * @throws UnivaHttpException
     */
    public function store(
        Group $group,
        StoreGroupInviteRequest $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'invite');

        $invite = $group->invites()->create([
            'created_by' => $request->user()->id,
            'code' => strtoupper(Str::random(8)),
            'token' => Str::random(48),
            'max_uses' => $request->input('max_uses'),
            'expires_at' => $request->input('expires_at'),
        ]);

        $invite->load('creator');

        return ApiResponse::created('Invite created.', new GroupInviteResource($invite));
    }

    /**
     * @throws UnivaHttpException
     */
    public function destroy(
        Group $group,
        GroupInvite $invite,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'invite');
        abort_unless($invite->group_id === $group->id, 404);

        $invite->update(['status' => 'revoked']);

        return ApiResponse::ok('Invite revoked.');
    }

    /**
     * @throws UnivaHttpException
     */
    public function join(JoinGroupInviteRequest $request, JoinGroupByInvite $useCase): JsonResponse
    {
        $membership = $useCase->handle($request->user(), $request->string('identifier')->toString());

        return ApiResponse::ok('Joined group.', new GroupMemberResource($membership));
    }
}
