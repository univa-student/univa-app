<?php

namespace App\Modules\Groups\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Groups\Http\Requests\StoreGroupDeadlineRequest;
use App\Modules\Groups\Http\Requests\UpdateGroupDeadlineProgressRequest;
use App\Modules\Groups\Http\Requests\UpdateGroupDeadlineRequest;
use App\Modules\Groups\Http\Resources\GroupDeadlineResource;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupDeadline;
use App\Modules\Groups\Services\GroupDeadlineService;
use App\Modules\Groups\Services\GroupFileLinkService;
use App\Modules\Groups\Services\GroupPermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupDeadlineController extends Controller
{
    public function index(Group $group, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);

        $items = $group->deadlines()
            ->with(['subject', 'memberStatuses', 'attachmentLinks.file'])
            ->orderBy('due_at')
            ->get();

        return ApiResponse::data(GroupDeadlineResource::collection($items));
    }

    public function store(
        Group $group,
        StoreGroupDeadlineRequest $request,
        GroupPermissionService $permissions,
        GroupDeadlineService $service,
        GroupFileLinkService $fileLinks,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_deadlines');

        $data = $request->validated();
        $deadline = $service->create($group, $request->user(), $data);
        $fileLinks->sync($deadline, $data['file_ids'] ?? []);
        $deadline->load(['subject', 'memberStatuses', 'attachmentLinks.file']);

        return ApiResponse::created('Group deadline created.', new GroupDeadlineResource($deadline));
    }

    public function show(Group $group, GroupDeadline $deadline, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);
        abort_unless($deadline->group_id === $group->id, 404);
        $deadline->load(['subject', 'memberStatuses', 'attachmentLinks.file']);

        return ApiResponse::data(new GroupDeadlineResource($deadline));
    }

    public function update(
        Group $group,
        GroupDeadline $deadline,
        UpdateGroupDeadlineRequest $request,
        GroupPermissionService $permissions,
        GroupDeadlineService $service,
        GroupFileLinkService $fileLinks,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_deadlines');
        abort_unless($deadline->group_id === $group->id, 404);

        $data = $request->validated();
        $deadline = $service->update($deadline, $data);
        if (array_key_exists('file_ids', $data)) {
            $fileLinks->sync($deadline, $data['file_ids'] ?? []);
        }
        $deadline->load(['subject', 'memberStatuses', 'attachmentLinks.file']);

        return ApiResponse::ok('Group deadline updated.', new GroupDeadlineResource($deadline));
    }

    public function destroy(
        Group $group,
        GroupDeadline $deadline,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_deadlines');
        abort_unless($deadline->group_id === $group->id, 404);
        $deadline->delete();

        return ApiResponse::ok('Group deadline deleted.');
    }

    public function progress(
        Group $group,
        GroupDeadline $deadline,
        UpdateGroupDeadlineProgressRequest $request,
        GroupPermissionService $permissions,
        GroupDeadlineService $service,
    ): JsonResponse {
        $membership = $permissions->requireActiveMembership($request->user(), $group);
        abort_unless($deadline->group_id === $group->id, 404);

        $row = $service->updateProgress($deadline, $membership, $request->input('status'));

        return ApiResponse::ok('Deadline progress updated.', [
            'status' => $row->status?->value ?? $row->status,
            'completed_at' => $row->completed_at?->toISOString(),
        ]);
    }
}
