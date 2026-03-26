<?php

namespace App\Modules\Groups\Models;

use App\Modules\Groups\Enums\GroupChannelType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GroupChannel extends Model
{
    protected $fillable = [
        'group_id',
        'group_subject_id',
        'name',
        'slug',
        'type',
        'description',
        'is_default',
    ];

    protected $casts = [
        'type' => GroupChannelType::class,
        'is_default' => 'boolean',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(GroupSubject::class, 'group_subject_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(GroupMessage::class, 'group_channel_id');
    }
}
