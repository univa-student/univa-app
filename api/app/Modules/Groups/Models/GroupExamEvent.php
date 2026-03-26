<?php

namespace App\Modules\Groups\Models;

use App\Modules\Schedule\Models\ExamType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupExamEvent extends Model
{
    protected $fillable = [
        'group_id',
        'group_subject_id',
        'exam_type_id',
        'starts_at',
        'ends_at',
        'location_text',
        'note',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(GroupSubject::class, 'group_subject_id');
    }

    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class);
    }
}
