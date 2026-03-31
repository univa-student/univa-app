<?php

namespace App\Modules\Planner\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Planner\Http\Requests\CreatePlannerBlockRequest;
use App\Modules\Planner\Http\Requests\IndexPlannerBlocksRequest;
use App\Modules\Planner\Http\Requests\MovePlannerBlockRequest;
use App\Modules\Planner\Http\Requests\ResizePlannerBlockRequest;
use App\Modules\Planner\Http\Requests\UpdatePlannerBlockRequest;
use App\Modules\Planner\Http\Requests\UpdatePlannerBlockStatusRequest;
use App\Modules\Planner\Http\Resources\PlannerBlockResource;
use App\Modules\Planner\Models\PlannerBlock;
use App\Modules\Planner\Services\PlannerTimelineService;
use App\Modules\Planner\UseCases\CreatePlannerBlock;
use App\Modules\Planner\UseCases\DeletePlannerBlock;
use App\Modules\Planner\UseCases\MovePlannerBlock;
use App\Modules\Planner\UseCases\ResizePlannerBlock;
use App\Modules\Planner\UseCases\UpdatePlannerBlock;
use App\Modules\Planner\UseCases\UpdatePlannerBlockStatus;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class PlannerBlockController extends Controller
{
    public function index(IndexPlannerBlocksRequest $request, PlannerTimelineService $timelineService): JsonResponse
    {
        $this->authorize('viewAny', PlannerBlock::class);

        $blocks = $timelineService->getBlocksInRange(
            (int) $request->user()->id,
            Carbon::parse($request->input('start_at')),
            Carbon::parse($request->input('end_at')),
        );

        return ApiResponse::data(PlannerBlockResource::collection($blocks));
    }

    public function store(CreatePlannerBlockRequest $request, CreatePlannerBlock $useCase): JsonResponse
    {
        $this->authorize('create', PlannerBlock::class);

        $result = $useCase->handle($request->user(), $request->validated());

        return ApiResponse::created(
            data: new PlannerBlockResource($result['block']),
            meta: $result['meta'],
        );
    }

    public function update(UpdatePlannerBlockRequest $request, PlannerBlock $plannerBlock, UpdatePlannerBlock $useCase): JsonResponse
    {
        $this->authorize('update', $plannerBlock);

        $result = $useCase->handle($plannerBlock, $request->validated());

        return ApiResponse::ok(
            'Planner block оновлено.',
            new PlannerBlockResource($result['block']),
            $result['meta'],
        );
    }

    public function destroy(PlannerBlock $plannerBlock, DeletePlannerBlock $useCase): JsonResponse
    {
        $this->authorize('delete', $plannerBlock);

        $useCase->handle($plannerBlock);

        return ApiResponse::ok('Planner block видалено.');
    }

    public function status(UpdatePlannerBlockStatusRequest $request, PlannerBlock $plannerBlock, UpdatePlannerBlockStatus $useCase): JsonResponse
    {
        $this->authorize('update', $plannerBlock);

        $block = $useCase->handle($plannerBlock, $request->validated());

        return ApiResponse::ok('Статус planner block оновлено.', new PlannerBlockResource($block));
    }

    public function move(MovePlannerBlockRequest $request, PlannerBlock $plannerBlock, MovePlannerBlock $useCase): JsonResponse
    {
        $this->authorize('update', $plannerBlock);

        $result = $useCase->handle($plannerBlock, $request->validated());

        return ApiResponse::ok(
            'Planner block переміщено.',
            new PlannerBlockResource($result['block']),
            $result['meta'],
        );
    }

    public function resize(ResizePlannerBlockRequest $request, PlannerBlock $plannerBlock, ResizePlannerBlock $useCase): JsonResponse
    {
        $this->authorize('update', $plannerBlock);

        $result = $useCase->handle($plannerBlock, $request->validated());

        return ApiResponse::ok(
            'Тривалість planner block оновлено.',
            new PlannerBlockResource($result['block']),
            $result['meta'],
        );
    }
}
