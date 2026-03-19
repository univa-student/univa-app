<?php

namespace App\Modules\Profiles\Models;

use Illuminate\Database\Eloquent\Model;

class University extends Model
{
    protected $table = 'universities';

    protected $fillable = [
        'university_id',
        'region_code',
        'university_name',
        'university_short_name',
        'university_type_name',
        'faculty_name',
        'group_code',
        'course',
        'user_id',
        'location',
    ];
}
