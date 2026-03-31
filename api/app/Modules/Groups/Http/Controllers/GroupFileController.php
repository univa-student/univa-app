<?php

namespace App\Modules\Groups\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Files\Http\Resources\FileResource;
use App\Modules\Files\Http\Resources\FolderResource;
use App\Modules\Files\Models\File;
use App\Modules\Files\Models\Folder;
use App\Modules\Files\Services\FileService;
use App\Modules\Files\Services\FolderService;
use App\Modules\Groups\Http\Requests\StoreGroupFileRequest;
use App\Modules\Groups\Http\Requests\StoreGroupFolderRequest;
use App\Modules\Groups\Http\Requests\ImportGroupFilesRequest;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Services\GroupPermissionService;
use App\Modules\Groups\UseCases\ImportFilesToGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GroupFileController extends Controller
{
    public function index(Group $group, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);

        $query = File::query()
            ->with(['user', 'groupSubject'])
            ->where('group_id', $group->id)
            ->where('status', 'ready');

        if ($request->filled('folder_id')) {
            $query->where('folder_id', $request->integer('folder_id'));
        } elseif (! $request->filled('group_subject_id')) {
            $query->whereNull('folder_id');
        }

        if ($request->filled('group_subject_id')) {
            $query->where('group_subject_id', $request->integer('group_subject_id'));
        }

        $files = $query->orderByDesc('is_pinned')->orderByDesc('updated_at')->get();

        return ApiResponse::data(FileResource::collection($files));
    }

    /**
     * @throws UnivaHttpException
     */
    public function recent(Group $group, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);

        $files = File::query()
            ->with(['user', 'groupSubject'])
            ->where('group_id', $group->id)
            ->where('status', 'ready')
            ->orderByDesc('updated_at')
            ->limit(20)
            ->get();

        return ApiResponse::data(FileResource::collection($files));
    }

    public function store(
        Group $group,
        StoreGroupFileRequest $request,
        GroupPermissionService $permissions,
        FileService $service,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_files');

        $file = $service->upload(
            (int) $request->user()->id,
            $request->file('file'),
            $request->integer('folder_id') ?: null,
            null,
            'group',
            $group->id,
            $request->integer('group_subject_id') ?: null,
        );

        return ApiResponse::created('Файл завантажено.', new FileResource($file->load(['user', 'groupSubject'])));
    }

    public function import(
        Group $group,
        ImportGroupFilesRequest $request,
        GroupPermissionService $permissions,
        ImportFilesToGroup $useCase,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_files');

        $files = $useCase->handle(
            $request->user(),
            $group,
            $request->input('file_ids', []),
            $request->integer('group_subject_id') ?: null,
        );

        return ApiResponse::created('Файли імпортовано.', FileResource::collection($files));
    }

    public function show(Group $group, File $file, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);
        if ($file->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }

        return ApiResponse::data(new FileResource($file->load(['user', 'groupSubject'])));
    }

    public function download(
        Group $group,
        File $file,
        Request $request,
        GroupPermissionService $permissions,
        FileService $service,
    ): StreamedResponse {
        $permissions->requireActiveMembership($request->user(), $group);
        if ($file->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }

        $stream = $service->downloadStream($file);

        return response()->streamDownload(function () use ($stream) {
            fpassthru($stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        }, $file->original_name, [
            'Content-Type' => $file->mime_type ?? 'application/octet-stream',
        ]);
    }

    public function folders(Group $group, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);

        $query = Folder::query()->where('group_id', $group->id);

        if ($request->filled('parent_id')) {
            $query->where('parent_id', $request->integer('parent_id'));
        } else {
            $query->whereNull('parent_id');
        }

        if ($request->filled('group_subject_id')) {
            $query->where('group_subject_id', $request->integer('group_subject_id'));
        }

        return ApiResponse::data(FolderResource::collection($query->orderBy('name')->get()));
    }

    public function storeFolder(
        Group $group,
        StoreGroupFolderRequest $request,
        GroupPermissionService $permissions,
        FolderService $service,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_files');

        $folder = $service->create(
            (int) $request->user()->id,
            $request->input('name'),
            $request->integer('parent_id') ?: null,
            null,
            $group->id,
            $request->integer('group_subject_id') ?: null,
        );

        return ApiResponse::created('Папку створено.', new FolderResource($folder));
    }
}
