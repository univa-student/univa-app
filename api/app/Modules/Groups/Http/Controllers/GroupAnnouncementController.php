<?php

namespace App\Modules\Groups\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
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

        return ApiResponse::created('Оголошення створено.', new GroupAnnouncementResource($announcement));
    }

    public function show(Group $group, GroupAnnouncement $announcement, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);
        if ($announcement->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }
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
        if ($announcement->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }

        $data = $request->validated();
        $announcement->update($data);

        if (array_key_exists('file_ids', $data)) {
            $fileLinks->sync($announcement, $data['file_ids'] ?? []);
        }

        $announcement->load(['creator', 'acknowledgements', 'attachmentLinks.file']);

        return ApiResponse::ok('Оголошення оновлено.', new GroupAnnouncementResource($announcement));
    }

    public function destroy(
        Group $group,
        GroupAnnouncement $announcement,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'post_announcements');
        if ($announcement->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }

        $announcement->delete();

        return ApiResponse::ok('Оголошення видалено.');
    }

    public function acknowledge(
        Group $group,
        GroupAnnouncement $announcement,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $membership = $permissions->requireActiveMembership($request->user(), $group);
        if ($announcement->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }

        $ack = GroupAnnouncementAcknowledgement::query()->updateOrCreate(
            [
                'group_announcement_id' => $announcement->id,
                'user_id' => $membership->user_id,
            ],
            [
                'acknowledged_at' => now(),
            ]
        );

        return ApiResponse::ok('Оголошення позначено як переглянуте.', [
            'id' => $ack->id,
            'acknowledged_at' => $ack->acknowledged_at?->toISOString(),
        ]);
    }
}
