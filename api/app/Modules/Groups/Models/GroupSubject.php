<?php

namespace App\Modules\Groups\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupSubject extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'group_id',
        'name',
        'teacher_name',
        'color',
        'description',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function channels(): HasMany
    {
        return $this->hasMany(GroupChannel::class);
    }
}
