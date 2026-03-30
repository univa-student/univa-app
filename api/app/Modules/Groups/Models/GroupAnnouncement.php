<?php

namespace App\Modules\Groups\Models;

use App\Models\User;
use App\Modules\Files\Models\FileLink;
use App\Modules\Groups\Enums\GroupAnnouncementType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupAnnouncement extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'group_id',
        'group_channel_id',
        'created_by',
        'title',
        'content',
        'type',
        'is_pinned',
        'requires_acknowledgement',
        'starts_at',
        'ends_at',
        'deadline_at',
        'reactions',
        'comments_count',
    ];

    protected $casts = [
        'type' => GroupAnnouncementType::class,
        'is_pinned' => 'boolean',
        'requires_acknowledgement' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'deadline_at' => 'datetime',
        'reactions' => 'array',
        'comments_count' => 'integer',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(GroupChannel::class, 'group_channel_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function acknowledgements(): HasMany
    {
        return $this->hasMany(GroupAnnouncementAcknowledgement::class);
    }

    public function attachmentLinks(): HasMany
    {
        return $this->hasMany(FileLink::class, 'linkable_id')
            ->where('linkable_type', self::class);
    }
}
