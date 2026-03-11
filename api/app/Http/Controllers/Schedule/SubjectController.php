<?php

namespace App\Http\Controllers\Schedule;

use App\Core\Response\ApiResponse;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Schedule\StoreSubjectRequest;
use App\Http\Requests\Schedule\UpdateSubjectRequest;
use App\Models\Schedule\Subject;
use App\Services\Schedule\SubjectService;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\Schedule\SubjectResource;
use App\Http\Resources\Files\FolderResource;
use App\Models\Files\Folder;

class SubjectController extends Controller
{
    public function __construct(
        private readonly SubjectService $service,
    ) {}

    public function index(): JsonResponse
    {
        $subjects = $this->service->listForUser((int) auth()->id());

        return ApiResponse::data(SubjectResource::collection($subjects));
    }

    /**
     * @throws UnivaHttpException
     */
    public function store(StoreSubjectRequest $request): JsonResponse
    {
        $subject = $this->service->create((int) auth()->id(), $request->validated());

        return ApiResponse::created('Subject created.', $subject);
    }

    /**
     * @throws UnivaHttpException
     */
    public function update(UpdateSubjectRequest $request, Subject $subject): JsonResponse
    {
        $this->authorize('update', $subject);

        $updated = $this->service->update($subject, $request->validated());

        return ApiResponse::ok('Subject updated.', $updated);
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $this->authorize('delete', $subject);

        $this->service->delete($subject);

        return ApiResponse::ok('Subject deleted.');
    }

    public function folder(Subject $subject): JsonResponse
    {
        if ($subject->user_id !== auth()->id()) {
            abort(403);
        }

        $folder = Folder::firstOrCreate(
            [
                'user_id' => auth()->id(),
                'subject_id' => $subject->id,
                'parent_id' => null,
            ],
            [
                'name' => $subject->name,
            ]
        );

        return ApiResponse::data(new FolderResource($folder));
    }
}
