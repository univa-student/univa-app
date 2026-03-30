<?php

namespace App\Modules\Files\Models;

use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupSubject;
use App\Modules\Subjects\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Folder extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'parent_id',
        'subject_id',
        'group_id',
        'group_subject_id',
        'name',
    ];

    // ── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /**
     * Recursive children — for loading the entire tree in one eager-load.
     */
    public function recursiveChildren(): HasMany
    {
        return $this->children()->with(['recursiveChildren', 'files'])->orderBy('name');
    }

    public function files(): HasMany
    {
        return $this->hasMany(File::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function groupSubject(): BelongsTo
    {
        return $this->belongsTo(GroupSubject::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function isOwnedBy(int $userId): bool
    {
        return $this->user_id === $userId;
    }
}
