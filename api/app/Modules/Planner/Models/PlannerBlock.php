<?php

namespace App\Modules\Planner\Models;

use App\Models\User;
use App\Modules\Deadlines\Models\Deadline;
use App\Modules\Organizer\Models\Task;
use App\Modules\Planner\Enums\PlannerBlockStatus;
use App\Modules\Planner\Enums\PlannerBlockType;
use App\Modules\Planner\Enums\PlannerEnergyLevel;
use App\Modules\Planner\Enums\PlannerSourceType;
use App\Modules\Schedule\Models\ScheduleLesson;
use App\Modules\Subjects\Models\Subject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PlannerBlock extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'type',
        'status',
        'start_at',
        'end_at',
        'date',
        'is_all_day',
        'is_locked',
        'created_by_ai',
        'color',
        'source_type',
        'source_id',
        'subject_id',
        'task_id',
        'deadline_id',
        'schedule_lesson_id',
        'priority',
        'estimated_minutes',
        'actual_minutes',
        'energy_level',
        'meta',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'date' => 'date',
        'is_all_day' => 'boolean',
        'is_locked' => 'boolean',
        'created_by_ai' => 'boolean',
        'priority' => 'integer',
        'estimated_minutes' => 'integer',
        'actual_minutes' => 'integer',
        'meta' => 'array',
        'type' => PlannerBlockType::class,
        'status' => PlannerBlockStatus::class,
        'energy_level' => PlannerEnergyLevel::class,
        'source_type' => PlannerSourceType::class,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function deadline(): BelongsTo
    {
        return $this->belongsTo(Deadline::class);
    }

    public function scheduleLesson(): BelongsTo
    {
        return $this->belongsTo(ScheduleLesson::class);
    }

    public function scopeOwnedBy(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeInRange(Builder $query, string $startAt, string $endAt): Builder
    {
        return $query
            ->where('start_at', '<', $endAt)
            ->where('end_at', '>', $startAt);
    }
}
