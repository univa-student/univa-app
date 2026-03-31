<?php

namespace App\Modules\Planner\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Deadlines\Models\Deadline;
use App\Modules\Organizer\Models\Task;
use App\Modules\Planner\Http\Requests\PlanDeadlineRequest;
use App\Modules\Planner\Http\Requests\PlanTaskRequest;
use App\Modules\Planner\Http\Resources\PlannerBlockResource;
use App\Modules\Planner\UseCases\CreatePlannerBlocksFromDeadline;
use App\Modules\Planner\UseCases\CreatePlannerBlocksFromTask;
use Illuminate\Http\JsonResponse;

class PlannerSourcePlanningController extends Controller
{
    public function task(PlanTaskRequest $request, Task $task, CreatePlannerBlocksFromTask $useCase): JsonResponse
    {
        $this->authorize('view', $task);

        $result = $useCase->handle($request->user(), $task, $request->validated());

        return ApiResponse::created(
            data: new PlannerBlockResource($result['block']),
            meta: $result['meta'],
        );
    }

    public function deadline(PlanDeadlineRequest $request, Deadline $deadline, CreatePlannerBlocksFromDeadline $useCase): JsonResponse
    {
        $this->authorize('view', $deadline);

        $result = $useCase->handle($request->user(), $deadline, $request->validated());

        return ApiResponse::created(
            data: PlannerBlockResource::collection(collect($result['blocks'])),
            meta: $result['meta'],
        );
    }
}
