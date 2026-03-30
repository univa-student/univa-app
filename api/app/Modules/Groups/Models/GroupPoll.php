<?php

namespace App\Modules\Groups\Models;

use App\Models\User;
use App\Modules\Groups\Enums\GroupPollStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupPoll extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'group_id',
        'created_by',
        'title',
        'description',
        'allows_multiple',
        'is_anonymous',
        'show_results',
        'status',
        'closes_at',
    ];

    protected $casts = [
        'allows_multiple' => 'boolean',
        'is_anonymous' => 'boolean',
        'show_results' => 'boolean',
        'status' => GroupPollStatus::class,
        'closes_at' => 'datetime',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function options(): HasMany
    {
        return $this->hasMany(GroupPollOption::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(GroupPollVote::class);
    }
}
