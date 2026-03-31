<?php

namespace App\Modules\Deadlines\Http\Controllers;

use App\Modules\Deadlines\UseCases\CreateDeadline;
use App\Modules\Deadlines\UseCases\UpdateDeadline;
use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Deadlines\Http\Requests\StoreDeadlineRequest;
use App\Modules\Deadlines\Http\Requests\UpdateDeadlineRequest;
use App\Modules\Deadlines\Http\Resources\DeadlineResource;
use App\Modules\Deadlines\Models\Deadline;
use App\Modules\Deadlines\Services\DeadlineQueryService;
use Carbon\Constants\UnitValue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DeadlineController extends Controller
{
    public function index(Request $request, DeadlineQueryService $queryService): JsonResponse
    {
        $this->authorize('viewAny', Deadline::class);

        $deadlines = $queryService->getFilteredDeadlines($request->user(), $request->all())->get();

        return ApiResponse::data(DeadlineResource::collection($deadlines));
    }

    /**
     * Get statistics/counts for deadline tabs.
     */
    public function stats(Request $request, DeadlineQueryService $queryService): JsonResponse
    {
        $this->authorize('viewAny', Deadline::class);
        $user = $request->user();

        $now = Carbon::now();
        $weekEnd = $now->copy()->endOfWeek(UnitValue::SUNDAY);

        return ApiResponse::data([
            'all' => $queryService->getFilteredDeadlines($user)->count(),
            'today' => $queryService->getFilteredDeadlines($user, ['time_frame' => 'today'])->count(),
            'upcoming' => $queryService->getFilteredDeadlines($user, ['time_frame' => 'upcoming'])->count(),
            'overdue' => $queryService->getFilteredDeadlines($user, ['time_frame' => 'overdue'])->count(),
            'completed' => $queryService->getFilteredDeadlines($user, ['status' => 'completed'])->count(),
            'this_week' => $queryService->getFilteredDeadlines($user, [
                'date_from' => $now->toDateString(),
                'date_to' => $weekEnd->toDateString(),
            ])->where('status', '!=', Deadline::STATUS_COMPLETED)->count(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDeadlineRequest $request, CreateDeadline $action): JsonResponse
    {
        $this->authorize('create', Deadline::class);

        $deadline = $action->handle($request->user(), $request->validated());

        return ApiResponse::created(
            data: new DeadlineResource($deadline)
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Deadline $deadline): JsonResponse
    {
        $this->authorize('view', $deadline);

        $deadline->load(['subject', 'files']);

        return ApiResponse::data(new DeadlineResource($deadline));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDeadlineRequest $request, Deadline $deadline, UpdateDeadline $action): JsonResponse
    {
        $this->authorize('update', $deadline);

        $deadline = $action->handle($deadline, $request->validated());

        return ApiResponse::ok(
            'Дедлайн успішно оновлено.',
            new DeadlineResource($deadline),
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Deadline $deadline): JsonResponse
    {
        $this->authorize('delete', $deadline);

        $deadline->delete();

        return ApiResponse::ok(
            'Дедлайн успішно видалено.'
        );
    }
}
