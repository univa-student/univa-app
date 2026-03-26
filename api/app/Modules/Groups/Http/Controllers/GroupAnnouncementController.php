<?php

namespace App\Modules\Groups\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Groups\Http\Requests\StoreGroupAnnouncementRequest;
use App\Modules\Groups\Http\Requests\UpdateGroupAnnouncementRequest;
use App\Modules\Groups\Http\Resources\GroupAnnouncementResource;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupAnnouncement;
use App\Modules\Groups\Models\GroupAnnouncementAcknowledgement;
use App\Modules\Groups\Services\GroupFileLinkService;
use App\Modules\Groups\Services\GroupPermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupAnnouncementController extends Controller
{
    public function index(Group $group, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);

        $items = $group->announcements()
            ->with(['creator', 'acknowledgements', 'attachmentLinks.file'])
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->get();

        return ApiResponse::data(GroupAnnouncementResource::collection($items));
    }

    public function store(
        Group $group,
        StoreGroupAnnouncementRequest $request,
        GroupPermissionService $permissions,
        GroupFileLinkService $fileLinks,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'post_announcements');

        $data = $request->validated();
        $announcement = $group->announcements()->create([
            ...$data,
            'created_by' => $request->user()->id,
        ]);

        $fileLinks->sync($announcement, $data['file_ids'] ?? []);
        $announcement->load(['creator', 'acknowledgements', 'attachmentLinks.file']);

        return ApiResponse::created('Announcement created.', new GroupAnnouncementResource($announcement));
    }

    public function show(Group $group, GroupAnnouncement $announcement, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);
        abort_unless($announcement->group_id === $group->id, 404);
        $announcement->load(['creator', 'acknowledgements', 'attachmentLinks.file']);

        return ApiResponse::data(new GroupAnnouncementResource($announcement));
    }

    public function update(
        Group $group,
        GroupAnnouncement $announcement,
        UpdateGroupAnnouncementRequest $request,
        GroupPermissionService $permissions,
        GroupFileLinkService $fileLinks,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'post_announcements');
        abort_unless($announcement->group_id === $group->id, 404);

        $data = $request->validated();
        $announcement->update($data);

        if (array_key_exists('file_ids', $data)) {
            $fileLinks->sync($announcement, $data['file_ids'] ?? []);
        }

        $announcement->load(['creator', 'acknowledgements', 'attachmentLinks.file']);

        return ApiResponse::ok('Announcement updated.', new GroupAnnouncementResource($announcement));
    }

    public function destroy(
        Group $group,
        GroupAnnouncement $announcement,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'post_announcements');
        abort_unless($announcement->group_id === $group->id, 404);

        $announcement->delete();

        return ApiResponse::ok('Announcement deleted.');
    }

    public function acknowledge(
        Group $group,
        GroupAnnouncement $announcement,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $membership = $permissions->requireActiveMembership($request->user(), $group);
        abort_unless($announcement->group_id === $group->id, 404);

        $ack = GroupAnnouncementAcknowledgement::query()->updateOrCreate(
            [
                'group_announcement_id' => $announcement->id,
                'user_id' => $membership->user_id,
            ],
            [
                'acknowledged_at' => now(),
            ]
        );

        return ApiResponse::ok('Announcement acknowledged.', [
            'id' => $ack->id,
            'acknowledged_at' => $ack->acknowledged_at?->toISOString(),
        ]);
    }
}
