<?php

declare(strict_types=1);

namespace App\Modules\Ai\Context\Builders;

use App\Models\User;
use App\Modules\Ai\Contracts\ContextBuilderContract;
use App\Modules\Ai\DTO\DailyDigestContextData;
use App\Modules\Ai\DTO\GenerateDailyDigestData;
use App\Modules\Ai\Exceptions\AiContextException;
use App\Modules\Deadlines\Models\Deadline;
use App\Modules\Deadlines\Services\DeadlineQueryService;
use App\Modules\Files\Services\FileService;
use App\Modules\Schedule\Services\ExamEventService;
use App\Modules\Schedule\Services\ScheduleService;
use Carbon\Carbon;

final readonly class DailyDigestContextBuilder implements ContextBuilderContract
{
    public function __construct(
        private DeadlineQueryService $deadlineQueryService,
        private ScheduleService $scheduleService,
        private ExamEventService $examEventService,
        private FileService $fileService,
    ) {
    }

    /**
     * @throws AiContextException
     */
    public function build(object $data): object
    {
        if (!$data instanceof GenerateDailyDigestData) {
            throw AiContextException::invalidDto(
                GenerateDailyDigestData::class,
                get_debug_type($data),
            );
        }

        return $this->buildFromData($data);
    }

    /**
     * @throws AiContextException
     */
    public function buildFromData(GenerateDailyDigestData $data): DailyDigestContextData
    {
        $user = User::query()->find($data->userId);

        if (!$user instanceof User) {
            throw AiContextException::fromMessage(
                'Не вдалося знайти користувача для AI-дайджесту.',
                ['user_id' => $data->userId],
            );
        }

        $from = Carbon::parse($data->date->toDateString())->startOfDay();
        $to = Carbon::parse($data->date->toDateString())->endOfDay();

        $todayLessons = $this->formatLessons(
            array_merge(
                $this->scheduleService->buildForRange($user->id, $from, $to),
                $this->formatExams($this->examEventService->listForUser(
                    $user->id,
                    $data->date->toDateString(),
                    $data->date->toDateString(),
                )),
            ),
        );

        $priorityDeadlines = $this->formatDeadlines(
            $this->deadlineQueryService->getFilteredDeadlines($user, [
                'sort_by' => 'due_at',
                'sort_dir' => 'asc',
                'status' => [Deadline::STATUS_NEW, Deadline::STATUS_IN_PROGRESS],
            ])->limit(5)->get()->all(),
        );

        $recentFiles = $this->formatFiles($this->fileService->recent($user->id, 5));

        $storageUsed = (int) ($user->storage_used ?? 0);
        $storageLimit = max(1, (int) ($user->storage_limit ?? 1));

        return new DailyDigestContextData(
            userId: $user->id,
            userName: trim((string) ($user->first_name ?? 'Студент')),
            date: $data->date,
            todayLessons: $todayLessons,
            priorityDeadlines: $priorityDeadlines,
            recentFiles: $recentFiles,
            stats: [
                'all_deadlines' => $this->deadlineQueryService->getFilteredDeadlines($user)->count(),
                'today_deadlines' => $this->deadlineQueryService->getFilteredDeadlines($user, ['time_frame' => 'today'])->count(),
                'upcoming_deadlines' => $this->deadlineQueryService->getFilteredDeadlines($user, ['time_frame' => 'upcoming'])->count(),
                'overdue_deadlines' => $this->deadlineQueryService->getFilteredDeadlines($user, ['time_frame' => 'overdue'])->count(),
                'completed_deadlines' => $this->deadlineQueryService->getFilteredDeadlines($user, ['status' => Deadline::STATUS_COMPLETED])->count(),
                'today_lessons_count' => count($todayLessons),
                'recent_files_count' => count($recentFiles),
            ],
            storage: [
                'used' => $storageUsed,
                'limit' => $storageLimit,
                'used_percent' => (int) round(($storageUsed / $storageLimit) * 100),
            ],
        );
    }

    /**
     * @param array<int, array<string, mixed>> $lessons
     * @return array<int, array<string, mixed>>
     */
    private function formatLessons(array $lessons): array
    {
        usort($lessons, static function (array $left, array $right): int {
            return strcmp(
                (string) ($left['date'] ?? '') . (string) ($left['starts_at'] ?? ''),
                (string) ($right['date'] ?? '') . (string) ($right['starts_at'] ?? ''),
            );
        });

        return array_values(array_map(static function (array $lesson): array {
            return [
                'subject' => (string) data_get($lesson, 'subject.name', 'Предмет'),
                'starts_at' => (string) ($lesson['starts_at'] ?? ''),
                'ends_at' => isset($lesson['ends_at']) ? (string) $lesson['ends_at'] : null,
                'location' => isset($lesson['location']) ? (string) $lesson['location'] : null,
                'type' => (string) data_get($lesson, 'lesson_type.name', data_get($lesson, 'exam_type.name', 'Подія')),
                'source' => (string) ($lesson['source'] ?? 'rule'),
            ];
        }, $lessons));
    }

    /**
     * @param array<int, object> $exams
     * @return array<int, array<string, mixed>>
     */
    private function formatExams(array $exams): array
    {
        return array_map(static function (object $exam): array {
            $subject = $exam->subject;
            $examType = $exam->examType;

            return [
                'date' => Carbon::parse($exam->starts_at)->toDateString(),
                'starts_at' => Carbon::parse($exam->starts_at)->format('H:i'),
                'ends_at' => $exam->ends_at ? Carbon::parse($exam->ends_at)->format('H:i') : null,
                'subject' => [
                    'name' => $subject?->name ?? 'Предмет',
                ],
                'exam_type' => [
                    'name' => $examType?->name ?? 'Іспит',
                ],
                'location' => $exam->location_text,
                'source' => 'exam',
            ];
        }, $exams);
    }

    /**
     * @param array<int, object> $deadlines
     * @return array<int, array<string, string|null>>
     */
    private function formatDeadlines(array $deadlines): array
    {
        return array_map(static function (object $deadline): array {
            return [
                'title' => (string) ($deadline->title ?? 'Дедлайн'),
                'subject' => (string) ($deadline->subject?->name ?? 'Предмет'),
                'priority' => isset($deadline->priority) ? (string) $deadline->priority : null,
                'status' => isset($deadline->status) ? (string) $deadline->status : null,
                'due_at' => $deadline->due_at?->toIso8601String(),
            ];
        }, $deadlines);
    }

    /**
     * @param array<int, object> $files
     * @return array<int, array<string, string|int|null>>
     */
    private function formatFiles(array $files): array
    {
        return array_map(static function (object $file): array {
            return [
                'name' => (string) ($file->original_name ?? 'Файл'),
                'mime_type' => isset($file->mime_type) ? (string) $file->mime_type : null,
                'size' => (int) ($file->size ?? 0),
                'updated_at' => $file->updated_at?->toIso8601String(),
            ];
        }, $files);
    }
}
