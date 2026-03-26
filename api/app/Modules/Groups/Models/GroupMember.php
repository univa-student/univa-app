<?php

namespace App\Modules\Groups\Models;

use App\Models\User;
use App\Modules\Groups\Enums\GroupMemberStatus;
use App\Modules\Groups\Enums\GroupRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupMember extends Model
{
    protected $fillable = [
        'group_id',
        'user_id',
        'role',
        'status',
        'nickname_in_group',
        'subgroup',
        'invited_by',
        'joined_at',
        'left_at',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
        'role' => GroupRole::class,
        'status' => GroupMemberStatus::class,
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
