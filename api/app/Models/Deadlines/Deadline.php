<?php

namespace App\Models\Deadlines;

use App\Models\Schedule\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Deadline extends Model
{
    /** @use HasFactory<\Database\Factories\Deadlines\DeadlineFactory> */
    use HasFactory, SoftDeletes;

    public const string TYPE_HOMEWORK = 'homework';
    public const string TYPE_LAB = 'lab';
    public const string TYPE_PRACTICE = 'practice';
    public const string TYPE_ESSAY = 'essay';
    public const string TYPE_PRESENTATION = 'presentation';
    public const string TYPE_MODULE = 'module';
    public const string TYPE_COURSEWORK = 'coursework';
    public const string TYPE_EXAM = 'exam';
    public const string TYPE_TEST = 'credit';
    public const string TYPE_OTHER = 'other';

    public const string PRIORITY_LOW = 'low';
    public const string PRIORITY_MEDIUM = 'medium';
    public const string PRIORITY_HIGH = 'high';
    public const string PRIORITY_CRITICAL = 'critical';

    public const string STATUS_NEW = 'new';
    public const string STATUS_IN_PROGRESS = 'in_progress';
    public const string STATUS_COMPLETED = 'completed';
    public const string STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'subject_id',
        'title',
        'description',
        'type',
        'priority',
        'status',
        'due_at',
        'completed_at',
    ];

    protected $casts = [
        'due_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function scopeOwnedBy(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForSubject(Builder $query, int $subjectId): Builder
    {
        return $query->where('subject_id', $subjectId);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', [self::STATUS_NEW, self::STATUS_IN_PROGRESS]);
    }
}
