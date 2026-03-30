<?php

namespace App\Modules\Groups\Models;

use App\Modules\Schedule\Models\DeliveryMode;
use App\Modules\Schedule\Models\LessonType;
use App\Modules\Schedule\Models\RecurrenceRule;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupScheduleLesson extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'group_id',
        'group_subject_id',
        'weekday',
        'starts_at',
        'ends_at',
        'lesson_type_id',
        'delivery_mode_id',
        'location_text',
        'note',
        'recurrence_rule_id',
        'active_from',
        'active_to',
    ];

    protected $casts = [
        'weekday' => 'integer',
        'active_from' => 'date',
        'active_to' => 'date',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(GroupSubject::class, 'group_subject_id');
    }

    public function lessonType(): BelongsTo
    {
        return $this->belongsTo(LessonType::class);
    }

    public function deliveryMode(): BelongsTo
    {
        return $this->belongsTo(DeliveryMode::class);
    }

    public function recurrenceRule(): BelongsTo
    {
        return $this->belongsTo(RecurrenceRule::class);
    }

    public function exceptions(): HasMany
    {
        return $this->hasMany(GroupScheduleLessonException::class);
    }
}
