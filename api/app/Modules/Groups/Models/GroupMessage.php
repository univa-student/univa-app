<?php

namespace App\Modules\Groups\Models;

use App\Models\User;
use App\Modules\Files\Models\File;
use App\Modules\Files\Models\FileLink;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupMessage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'group_channel_id',
        'user_id',
        'file_id',
        'reply_to_id',
        'type',
        'content',
        'is_important',
        'mentions',
        'reactions',
    ];

    protected $casts = [
        'is_important' => 'boolean',
        'mentions' => 'array',
        'reactions' => 'array',
    ];

    public function channel(): BelongsTo
    {
        return $this->belongsTo(GroupChannel::class, 'group_channel_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class);
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reply_to_id');
    }

    public function attachmentLinks(): HasMany
    {
        return $this->hasMany(FileLink::class, 'linkable_id')
            ->where('linkable_type', self::class);
    }
}
