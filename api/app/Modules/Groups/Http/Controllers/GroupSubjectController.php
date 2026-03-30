<?php

namespace App\Modules\Groups\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Files\Models\Folder;
use App\Modules\Groups\Http\Requests\StoreGroupSubjectRequest;
use App\Modules\Groups\Http\Requests\UpdateGroupSubjectRequest;
use App\Modules\Groups\Http\Resources\GroupSubjectResource;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupChannel;
use App\Modules\Groups\Models\GroupSubject;
use App\Modules\Groups\Services\GroupPermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GroupSubjectController extends Controller
{
    public function index(Group $group, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);

        $items = $group->subjects()->orderBy('name')->get();

        return ApiResponse::data(GroupSubjectResource::collection($items));
    }

    public function store(
        Group $group,
        StoreGroupSubjectRequest $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_subjects');

        $subject = $group->subjects()->create($request->validated());

        GroupChannel::query()->create([
            'group_id' => $group->id,
            'group_subject_id' => $subject->id,
            'name' => $subject->name,
            'slug' => Str::slug($subject->name).'-'.$subject->id,
            'type' => 'subject',
        ]);

        Folder::query()->firstOrCreate(
            [
                'group_id' => $group->id,
                'group_subject_id' => $subject->id,
                'parent_id' => null,
            ],
            [
                'user_id' => $request->user()->id,
                'name' => $subject->name,
            ]
        );

        return ApiResponse::created('Group subject created.', new GroupSubjectResource($subject));
    }

    public function update(
        Group $group,
        GroupSubject $subject,
        UpdateGroupSubjectRequest $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_subjects');
        abort_unless($subject->group_id === $group->id, 404);

        $subject->update($request->validated());

        return ApiResponse::ok('Group subject updated.', new GroupSubjectResource($subject));
    }

    public function destroy(
        Group $group,
        GroupSubject $subject,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_subjects');
        abort_unless($subject->group_id === $group->id, 404);

        $subject->delete();

        return ApiResponse::ok('Group subject deleted.');
    }
}
