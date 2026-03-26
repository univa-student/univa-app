<?php

namespace App\Modules\Groups\Models;

use App\Models\User;
use App\Modules\Groups\Enums\GroupInviteStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupInvite extends Model
{
    protected $fillable = [
        'group_id',
        'created_by',
        'code',
        'token',
        'status',
        'max_uses',
        'uses_count',
        'expires_at',
    ];

    protected $casts = [
        'max_uses' => 'integer',
        'uses_count' => 'integer',
        'expires_at' => 'datetime',
        'status' => GroupInviteStatus::class,
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isUsable(): bool
    {
        if ($this->status !== GroupInviteStatus::Active) {
            return false;
        }

        if ($this->expires_at !== null && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->max_uses !== null && $this->uses_count >= $this->max_uses) {
            return false;
        }

        return true;
    }
}
