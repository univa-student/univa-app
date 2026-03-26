<?php

namespace App\Modules\Groups\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Groups\Http\Requests\StoreGroupRequest;
use App\Modules\Groups\Http\Requests\UpdateGroupRequest;
use App\Modules\Groups\Http\Resources\GroupResource;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Services\GroupOverviewService;
use App\Modules\Groups\Services\GroupPermissionService;
use App\Modules\Groups\UseCases\CreateGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Group::class);

        $groups = Group::query()
            ->whereHas('members', fn ($query) => $query
                ->where('user_id', $request->user()->id)
                ->where('status', 'active'))
            ->with(['owner', 'creator'])
            ->withCount('members')
            ->orderBy('name')
            ->get();

        return ApiResponse::data(GroupResource::collection($groups));
    }

    public function store(StoreGroupRequest $request, CreateGroup $useCase): JsonResponse
    {
        $this->authorize('create', Group::class);

        $group = $useCase->handle($request->user(), $request->validated());

        return ApiResponse::created('Group created.', new GroupResource($group));
    }

    public function show(Group $group): JsonResponse
    {
        $this->authorize('view', $group);

        $group->load(['owner', 'creator'])->loadCount('members');

        return ApiResponse::data(new GroupResource($group));
    }

    public function update(UpdateGroupRequest $request, Group $group): JsonResponse
    {
        $this->authorize('update', $group);

        $group->update($request->validated());
        $group->load(['owner', 'creator'])->loadCount('members');

        return ApiResponse::ok('Group updated.', new GroupResource($group));
    }

    public function destroy(Group $group): JsonResponse
    {
        $this->authorize('delete', $group);

        $group->delete();

        return ApiResponse::ok('Group deleted.');
    }

    /**
     * @throws UnivaHttpException
     */
    public function overview(
        Group $group,
        Request $request,
        GroupOverviewService $overview,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->requireActiveMembership($request->user(), $group);

        return ApiResponse::data($overview->build($group));
    }
}
