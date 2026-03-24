<?php

namespace App\Modules\Schedule\Models;

use Illuminate\Database\Eloquent\Model;

class RecurrenceRule extends Model
{
    protected $fillable = ['code', 'name', 'meta'];

    protected $casts = [
        'meta' => 'array',
    ];
}
