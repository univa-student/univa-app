<?php

namespace App\Modules\Groups\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Group extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'slug',
        'description',
        'avatar',
        'color',
        'visibility',
        'join_policy',
        'is_active',
        'owner_id',
        'created_by',
        'institution_name',
        'institution_short_name',
        'faculty_name',
        'department_name',
        'specialty_name',
        'course',
        'study_year',
        'education_level',
        'study_form',
        'invite_role',
        'edit_role',
        'manage_subjects_role',
        'manage_schedule_role',
        'manage_deadlines_role',
        'manage_files_role',
        'post_announcements_role',
        'create_polls_role',
        'max_uses',
        'expires_at',
        'token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'course' => 'integer',
        'study_year' => 'integer',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members(): HasMany
    {
        return $this->hasMany(GroupMember::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_members')
            ->withPivot([
                'role',
                'status',
                'nickname_in_group',
                'subgroup',
                'joined_at',
                'left_at',
                'invited_by',
            ])
            ->withTimestamps();
    }

    public function invites(): HasMany
    {
        return $this->hasMany(GroupInvite::class);
    }

    public function joinRequests(): HasMany
    {
        return $this->hasMany(GroupJoinRequest::class);
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(GroupSubject::class);
    }

    public function channels(): HasMany
    {
        return $this->hasMany(GroupChannel::class);
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(GroupAnnouncement::class);
    }

    public function polls(): HasMany
    {
        return $this->hasMany(GroupPoll::class);
    }

    public function scheduleLessons(): HasMany
    {
        return $this->hasMany(GroupScheduleLesson::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(GroupExamEvent::class);
    }

    public function deadlines(): HasMany
    {
        return $this->hasMany(GroupDeadline::class);
    }
}
