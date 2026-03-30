<?php

namespace App\Modules\Groups\Models;

use App\Models\User;
use App\Modules\Files\Models\FileLink;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupDeadline extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'group_id',
        'group_subject_id',
        'created_by',
        'title',
        'description',
        'type',
        'priority',
        'due_at',
    ];

    protected $casts = [
        'due_at' => 'datetime',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(GroupSubject::class, 'group_subject_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function memberStatuses(): HasMany
    {
        return $this->hasMany(GroupDeadlineMemberStatus::class);
    }

    public function attachmentLinks(): HasMany
    {
        return $this->hasMany(FileLink::class, 'linkable_id')
            ->where('linkable_type', self::class);
    }
}
