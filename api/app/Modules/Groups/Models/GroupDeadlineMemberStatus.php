<?php

namespace App\Modules\Groups\Models;

use App\Models\User;
use App\Modules\Groups\Enums\GroupDeadlineProgressStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupDeadlineMemberStatus extends Model
{
    protected $fillable = [
        'group_deadline_id',
        'user_id',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'status' => GroupDeadlineProgressStatus::class,
        'completed_at' => 'datetime',
    ];

    public function deadline(): BelongsTo
    {
        return $this->belongsTo(GroupDeadline::class, 'group_deadline_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
