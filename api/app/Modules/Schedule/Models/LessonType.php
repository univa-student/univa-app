<?php

namespace App\Modules\Schedule\Models;

use Illuminate\Database\Eloquent\Model;

class LessonType extends Model
{
    protected $fillable = ['code', 'name', 'color'];
}
