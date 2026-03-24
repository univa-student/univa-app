<?php

namespace App\Modules\Files\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FilePermission extends Model
{
    protected $fillable = [
        'file_id',
        'user_id',
        'ability',
    ];

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
