<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    protected $table = 'profiles';

    public const TYPE_DEFAULT = 'default';
    public const TYPE_UNIVA = 'univa';

    protected $fillable = [
        'user_id',
        'profile_type',
        'profile_image',
        'bio',
        'phone',
        'telegram',
        'city',
        'birth_date',
        'university_id',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
