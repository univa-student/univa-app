<?php

namespace App\Http\Controllers\Files;

use App\Core\Response\ApiResponse;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Files\StoreFileRequest;
use App\Http\Requests\Files\UpdateFileRequest;
use App\Http\Requests\Files\SearchFileRequest;
use App\Models\Files\File;
use App\Services\Files\FileService;
use App\Http\Resources\Files\FileResource;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    public function __construct(
        private readonly FileService $service,
    ) {}

    /**
     * GET /files?folder_id=&subject_id=
     */
    public function index(Request $request): JsonResponse
    {
        $files = $this->service->list(
            (int) auth()->id(),
            $request->integer('folder_id') ?: null,
            $request->integer('subject_id') ?: null,
        );

        return ApiResponse::data(FileResource::collection($files));
    }

    /**
     * GET /storage/info
     */
    public function storageInfo(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        return ApiResponse::data([
            'used'  => (int) $user->storage_used,
            'limit' => (int) $user->storage_limit,
        ]);
    }

    /**
     * GET /files/recent
     */
    public function recent(): JsonResponse
    {
        $files = $this->service->recent((int) auth()->id());

        return ApiResponse::data(FileResource::collection($files));
    }

    /**
     * GET /files/search?q=&subject_id=
     */
    public function search(SearchFileRequest $request): JsonResponse
    {

        $files = $this->service->search(
            (int) auth()->id(),
            $request->string('q'),
            $request->integer('subject_id') ?: null,
        );

        return ApiResponse::data(FileResource::collection($files));
    }

    /**
     * GET /files/{file}
     */
    public function show(File $file): JsonResponse
    {
        $this->authorize('view', $file);

        $file->load(['folder', 'subject']);

        return ApiResponse::data(new FileResource($file));
    }

    /**
     * POST /files (multipart upload)
     */
    public function store(StoreFileRequest $request): JsonResponse
    {
        try {
            $file = $this->service->upload(
                (int) auth()->id(),
                $request->file('file'),
                $request->integer('folder_id') ?: null,
                $request->integer('subject_id') ?: null,
                $request->string('scope', 'personal'),
            );
        } catch (UnivaHttpException $e) {
            return $e->render();
        }

        return ApiResponse::created('File uploaded.', $file);
    }

    /**
     * PATCH /files/{file}
     */
    public function update(UpdateFileRequest $request, File $file): JsonResponse
    {
        $this->authorize('update', $file);

        $data = $request->validated();

        if (isset($data['name'])) {
            $file = $this->service->rename($file, $data['name']);
        }

        if (array_key_exists('folder_id', $data)) {
            $file = $this->service->move($file, $data['folder_id']);
        }

        if (isset($data['is_pinned'])) {
            $file = $this->service->togglePin($file);
        }

        return ApiResponse::ok('File updated.', $file);
    }

    /**
     * DELETE /files/{file}
     */
    public function destroy(File $file): JsonResponse
    {
        $this->authorize('delete', $file);

        $this->service->delete($file);

        return ApiResponse::ok('File deleted.');
    }

    /**
     * GET /files/{file}/download
     */
    public function download(File $file): StreamedResponse
    {
        $this->authorize('download', $file);

        $stream = $this->service->downloadStream($file);

        return response()->streamDownload(function () use ($stream) {
            fpassthru($stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        }, $file->original_name, [
            'Content-Type' => $file->mime_type ?? 'application/octet-stream',
        ]);
    }
}
