<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

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

    protected $casts = [
        'course' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }
}
