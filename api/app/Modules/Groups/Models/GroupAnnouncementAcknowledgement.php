<?php

namespace App\Modules\Groups\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupAnnouncementAcknowledgement extends Model
{
    protected $fillable = [
        'group_announcement_id',
        'user_id',
        'acknowledged_at',
    ];

    protected $casts = [
        'acknowledged_at' => 'datetime',
    ];

    public function announcement(): BelongsTo
    {
        return $this->belongsTo(GroupAnnouncement::class, 'group_announcement_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
