<?php

namespace App\Modules\Files\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class FileLink extends Model
{
    protected $fillable = [
        'file_id',
        'linkable_type',
        'linkable_id',
    ];

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class);
    }

    public function linkable(): MorphTo
    {
        return $this->morphTo();
    }
}
