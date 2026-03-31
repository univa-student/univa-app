<?php

namespace App\Modules\Organizer\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Organizer\Http\Requests\StoreTaskRequest;
use App\Modules\Organizer\Http\Requests\UpdateTaskRequest;
use App\Modules\Organizer\Http\Resources\TaskResource;
use App\Modules\Organizer\Models\Task;
use App\Modules\Organizer\Services\TaskQueryService;
use App\Modules\Organizer\UseCases\CreateTask;
use App\Modules\Organizer\UseCases\UpdateTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request, TaskQueryService $queryService): JsonResponse
    {
        $this->authorize('viewAny', Task::class);

        $tasks = $queryService->getFilteredTasks($request->user(), $request->all())->get();

        return ApiResponse::data(TaskResource::collection($tasks));
    }

    public function store(StoreTaskRequest $request, CreateTask $action): JsonResponse
    {
        $this->authorize('create', Task::class);

        $task = $action->handle($request->user(), $request->validated());

        return ApiResponse::created(data: new TaskResource($task));
    }

    public function show(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        return ApiResponse::data(new TaskResource($task));
    }

    public function update(UpdateTaskRequest $request, Task $task, UpdateTask $action): JsonResponse
    {
        $this->authorize('update', $task);

        $task = $action->handle($task, $request->validated());

        return ApiResponse::ok('Завдання успішно оновлено.', new TaskResource($task));
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        return ApiResponse::ok('Завдання успішно видалено.');
    }
}
