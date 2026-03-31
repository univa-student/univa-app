<?php

namespace App\Modules\Planner\Services;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Modules\Deadlines\Models\Deadline;
use App\Modules\Organizer\Models\Task;
use App\Modules\Schedule\Models\ScheduleLesson;
use App\Modules\Subjects\Models\Subject;

class PlannerOwnershipService
{
    public function getOwnedSubject(int $userId, ?int $subjectId): ?Subject
    {
        if ($subjectId === null) {
            return null;
        }

        $subject = Subject::query()
            ->whereKey($subjectId)
            ->where('user_id', $userId)
            ->first();

        if (! $subject instanceof Subject) {
            throw new UnivaHttpException('Предмет недоступний для цього користувача.', ResponseState::Unprocessable);
        }

        return $subject;
    }

    public function getOwnedTask(int $userId, ?int $taskId): ?Task
    {
        if ($taskId === null) {
            return null;
        }

        $task = Task::query()
            ->whereKey($taskId)
            ->where('user_id', $userId)
            ->first();

        if (! $task instanceof Task) {
            throw new UnivaHttpException('Задача недоступна для цього користувача.', ResponseState::Unprocessable);
        }

        return $task;
    }

    public function getOwnedDeadline(int $userId, ?int $deadlineId): ?Deadline
    {
        if ($deadlineId === null) {
            return null;
        }

        $deadline = Deadline::query()
            ->whereKey($deadlineId)
            ->where('user_id', $userId)
            ->first();

        if (! $deadline instanceof Deadline) {
            throw new UnivaHttpException('Дедлайн недоступний для цього користувача.', ResponseState::Unprocessable);
        }

        return $deadline;
    }

    public function getOwnedScheduleLesson(int $userId, ?int $scheduleLessonId): ?ScheduleLesson
    {
        if ($scheduleLessonId === null) {
            return null;
        }

        $lesson = ScheduleLesson::query()
            ->whereKey($scheduleLessonId)
            ->where('user_id', $userId)
            ->first();

        if (! $lesson instanceof ScheduleLesson) {
            throw new UnivaHttpException('Заняття недоступне для цього користувача.', ResponseState::Unprocessable);
        }

        return $lesson;
    }
}
