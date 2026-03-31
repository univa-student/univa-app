<?php

namespace App\Modules\Subjects\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Subjects\Http\Requests\StoreSubjectRequest;
use App\Modules\Subjects\Http\Requests\UpdateSubjectRequest;
use App\Modules\Subjects\Models\Subject;
use App\Modules\Subjects\Services\SubjectService;
use Illuminate\Http\JsonResponse;
use App\Modules\Subjects\Http\Resources\SubjectResource;
use App\Modules\Files\Http\Resources\FolderResource;
use App\Modules\Files\Models\Folder;

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

        return ApiResponse::created('Предмет створено.', $subject);
    }

    /**
     * @throws UnivaHttpException
     */
    public function update(UpdateSubjectRequest $request, Subject $subject): JsonResponse
    {
        $this->authorize('update', $subject);

        $updated = $this->service->update($subject, $request->validated());

        return ApiResponse::ok('Предмет оновлено.', $updated);
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $this->authorize('delete', $subject);

        $this->service->delete($subject);

        return ApiResponse::ok('Предмет видалено.');
    }

    public function folder(Subject $subject): JsonResponse
    {
        if ($subject->user_id !== auth()->id()) {
            throw new UnivaHttpException('Доступ заборонено.', ResponseState::Forbidden);
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
