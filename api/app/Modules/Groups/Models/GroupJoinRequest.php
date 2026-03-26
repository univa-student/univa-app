<?php

namespace App\Modules\Groups\Models;

use App\Models\User;
use App\Modules\Groups\Enums\GroupJoinRequestStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupJoinRequest extends Model
{
    protected $fillable = [
        'group_id',
        'user_id',
        'message',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'status' => GroupJoinRequestStatus::class,
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
