<?php

namespace App\Modules\Groups\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Groups\Http\Requests\IndexGroupScheduleRequest;
use App\Modules\Groups\Http\Requests\StoreGroupExamRequest;
use App\Modules\Groups\Http\Requests\StoreGroupScheduleExceptionRequest;
use App\Modules\Groups\Http\Requests\StoreGroupScheduleLessonRequest;
use App\Modules\Groups\Http\Requests\UpdateGroupExamRequest;
use App\Modules\Groups\Http\Requests\UpdateGroupScheduleLessonRequest;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupExamEvent;
use App\Modules\Groups\Models\GroupScheduleLesson;
use App\Modules\Groups\Models\GroupScheduleLessonException;
use App\Modules\Groups\Services\GroupPermissionService;
use App\Modules\Groups\Services\GroupScheduleService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupScheduleController extends Controller
{
    public function index(
        Group $group,
        IndexGroupScheduleRequest $request,
        GroupPermissionService $permissions,
        GroupScheduleService $service,
    ): JsonResponse {
        $permissions->requireActiveMembership($request->user(), $group);

        return ApiResponse::data(
            $service->buildForRange(
                $group,
                Carbon::parse($request->input('from'))->startOfDay(),
                Carbon::parse($request->input('to'))->endOfDay(),
            )
        );
    }

    public function storeLesson(
        Group $group,
        StoreGroupScheduleLessonRequest $request,
        GroupPermissionService $permissions,
        GroupScheduleService $service,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_schedule');
        $lesson = $service->storeLesson($group, $request->validated());

        return ApiResponse::created('Group lesson created.', $lesson->load(['subject', 'lessonType', 'deliveryMode', 'recurrenceRule']));
    }

    public function updateLesson(
        Group $group,
        GroupScheduleLesson $lesson,
        UpdateGroupScheduleLessonRequest $request,
        GroupPermissionService $permissions,
        GroupScheduleService $service,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_schedule');
        abort_unless($lesson->group_id === $group->id, 404);

        return ApiResponse::ok('Group lesson updated.', $service->updateLesson($lesson, $request->validated()));
    }

    public function destroyLesson(
        Group $group,
        GroupScheduleLesson $lesson,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_schedule');
        abort_unless($lesson->group_id === $group->id, 404);
        $lesson->delete();

        return ApiResponse::ok('Group lesson deleted.');
    }

    public function storeException(
        Group $group,
        GroupScheduleLesson $lesson,
        StoreGroupScheduleExceptionRequest $request,
        GroupPermissionService $permissions,
        GroupScheduleService $service,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_schedule');
        abort_unless($lesson->group_id === $group->id, 404);

        $exception = $service->storeException($lesson, $request->validated());

        return ApiResponse::created('Schedule exception created.', $exception);
    }

    public function destroyException(
        Group $group,
        GroupScheduleLessonException $exception,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_schedule');
        abort_unless($exception->lesson->group_id === $group->id, 404);
        $exception->delete();

        return ApiResponse::ok('Schedule exception deleted.');
    }

    public function storeExam(
        Group $group,
        StoreGroupExamRequest $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_schedule');

        $exam = GroupExamEvent::query()->create([
            ...$request->validated(),
            'group_id' => $group->id,
        ]);

        return ApiResponse::created('Group exam created.', $exam->load(['subject', 'examType']));
    }

    public function updateExam(
        Group $group,
        GroupExamEvent $exam,
        UpdateGroupExamRequest $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_schedule');
        abort_unless($exam->group_id === $group->id, 404);
        $exam->update($request->validated());

        return ApiResponse::ok('Group exam updated.', $exam->load(['subject', 'examType']));
    }

    public function destroyExam(
        Group $group,
        GroupExamEvent $exam,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'manage_schedule');
        abort_unless($exam->group_id === $group->id, 404);
        $exam->delete();

        return ApiResponse::ok('Group exam deleted.');
    }
}
