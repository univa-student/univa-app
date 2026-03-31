<?php

namespace App\Modules\Planner\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Planner\Http\Requests\GetPlannerDayRequest;
use App\Modules\Planner\Http\Requests\GetPlannerWeekRequest;
use App\Modules\Planner\Models\PlannerBlock;
use App\Modules\Planner\Services\PlannerTimelineService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class PlannerViewController extends Controller
{
    public function day(GetPlannerDayRequest $request, PlannerTimelineService $timelineService): JsonResponse
    {
        $this->authorize('viewAny', PlannerBlock::class);

        return ApiResponse::data(
            $timelineService->buildDayView(
                (int) $request->user()->id,
                Carbon::parse($request->input('date')),
            )
        );
    }

    public function week(GetPlannerWeekRequest $request, PlannerTimelineService $timelineService): JsonResponse
    {
        $this->authorize('viewAny', PlannerBlock::class);

        return ApiResponse::data(
            $timelineService->buildWeekView(
                (int) $request->user()->id,
                Carbon::parse($request->input('date')),
            )
        );
    }
}
