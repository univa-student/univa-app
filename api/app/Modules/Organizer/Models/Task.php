<?php

namespace App\Modules\Organizer\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
    public const string CATEGORY_STUDY = 'study';
    public const string CATEGORY_PERSONAL = 'personal';
    public const string CATEGORY_WORK = 'work';

    public const string PRIORITY_LOW = 'low';
    public const string PRIORITY_MEDIUM = 'medium';
    public const string PRIORITY_HIGH = 'high';
    public const string PRIORITY_CRITICAL = 'critical';

    public const string STATUS_TODO = 'todo';
    public const string STATUS_IN_PROGRESS = 'in_progress';
    public const string STATUS_DONE = 'done';
    public const string STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
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

    public function notes(): BelongsToMany
    {
        return $this->belongsToMany(Note::class, 'note_task')
            ->withTimestamps();
    }

    public function scopeOwnedBy(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }
}
