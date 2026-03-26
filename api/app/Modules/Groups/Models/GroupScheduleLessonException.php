<?php

namespace App\Modules\Groups\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupScheduleLessonException extends Model
{
    protected $fillable = [
        'group_schedule_lesson_id',
        'date',
        'action',
        'override_starts_at',
        'override_ends_at',
        'override_location_text',
        'override_teacher',
        'override_group_subject_id',
        'reason',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(GroupScheduleLesson::class, 'group_schedule_lesson_id');
    }

    public function overrideSubject(): BelongsTo
    {
        return $this->belongsTo(GroupSubject::class, 'override_group_subject_id');
    }
}
