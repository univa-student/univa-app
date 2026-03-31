<?php

namespace App\Modules\Planner\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Planner\Http\Requests\ApplyPlannerSuggestionsRequest;
use App\Modules\Planner\Http\Requests\GenerateDaySuggestionsRequest;
use App\Modules\Planner\Http\Resources\PlannerBlockResource;
use App\Modules\Planner\Models\PlannerBlock;
use App\Modules\Planner\Services\PlannerSuggestionService;
use App\Modules\Planner\UseCases\ApplyPlannerSuggestions;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class PlannerSuggestionController extends Controller
{
    public function day(GenerateDaySuggestionsRequest $request, PlannerSuggestionService $suggestionService): JsonResponse
    {
        $this->authorize('viewAny', PlannerBlock::class);

        return ApiResponse::data(
            $suggestionService->generateDaySuggestions(
                (int) $request->user()->id,
                Carbon::parse($request->input('date')),
                (bool) $request->boolean('include_tasks', true),
                (bool) $request->boolean('include_deadlines', true),
                (int) $request->integer('max_blocks', 6),
            )
        );
    }

    public function apply(ApplyPlannerSuggestionsRequest $request, ApplyPlannerSuggestions $useCase): JsonResponse
    {
        $this->authorize('create', PlannerBlock::class);

        $blocks = $useCase->handle($request->user(), $request->validated('blocks'));

        return ApiResponse::created(
            data: PlannerBlockResource::collection(collect($blocks)),
        );
    }
}
