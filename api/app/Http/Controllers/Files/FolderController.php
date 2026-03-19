<?php

namespace App\Http\Controllers\Files;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Files\StoreFolderRequest;
use App\Http\Requests\Files\UpdateFolderRequest;
use App\Models\Files\Folder;
use App\Services\Files\FolderService;
use App\Http\Resources\Files\FolderResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    public function __construct(
        private readonly FolderService $service,
    ) {}

    /**
     * GET /folders?parent_id=
     */
    public function index(Request $request): JsonResponse
    {
        $folders = $this->service->list(
            (int) auth()->id(),
            $request->integer('parent_id') ?: null,
        );

        return ApiResponse::data(FolderResource::collection($folders));
    }

    /**
     * GET /folders/tree
     */
    public function tree(): JsonResponse
    {
        $tree = $this->service->tree((int) auth()->id());

        return ApiResponse::data(FolderResource::collection($tree));
    }

    /**
     * POST /folders
     */
    public function store(StoreFolderRequest $request): JsonResponse
    {
        $data = $request->validated();

        $folder = $this->service->create(
            (int) auth()->id(),
            $data['name'],
            $data['parent_id'] ?? null,
            $data['subject_id'] ?? null,
        );

        return ApiResponse::created('Folder created.', $folder);
    }

    /**
     * PATCH /folders/{folder}
     */
    public function update(UpdateFolderRequest $request, Folder $folder): JsonResponse
    {
        $this->authorize('update', $folder);

        $data = $request->validated();

        if (isset($data['name'])) {
            $folder = $this->service->rename($folder, $data['name']);
        }

        if (array_key_exists('parent_id', $data)) {
            $folder = $this->service->move($folder, $data['parent_id']);
        }

        return ApiResponse::ok('Folder updated.', $folder);
    }

    /**
     * DELETE /folders/{folder}
     */
    public function destroy(Folder $folder): JsonResponse
    {
        $this->authorize('delete', $folder);

        $this->service->delete($folder);

        return ApiResponse::ok('Folder deleted.');
    }
}
