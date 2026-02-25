<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'email',
        'password',
        'full_name',
        'phone',
        'role',
        'avatar_path',
        'username',
        'university',
        'faculty',
        'specialty',
        'group',
        'course',
        'language',
        'timezone',
        'referral_code',
        'agree_terms',
        'marketing_opt_in',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (User $user) {
            // Generate full_name before saving (without causing recursion)
            $user->full_name = trim($user->last_name . ' ' . $user->first_name . ' ' . ($user->middle_name ?? ''));
        });
    }
}
