<?php

namespace App\Models\Files;

use App\Enums\FileScope;
use App\Enums\FileStatus;
use App\Models\Deadlines\Deadline;
use App\Models\Schedule\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class File extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'folder_id',
        'subject_id',
        'original_name',
        'mime_type',
        'size',
        'checksum',
        'storage_disk',
        'storage_key',
        'status',
        'scope',
        'is_pinned',
    ];

    protected $casts = [
        'size'      => 'integer',
        'is_pinned' => 'boolean',
        'status'    => FileStatus::class,
        'scope'     => FileScope::class,
    ];

    // ── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function deadlines(): BelongsToMany
    {
        return $this->belongsToMany(Deadline::class, 'deadline_file');
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(FilePermission::class);
    }

    public function links(): HasMany
    {
        return $this->hasMany(FileLink::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function isReady(): bool
    {
        return $this->status === FileStatus::Ready;
    }

    public function isOwnedBy(int $userId): bool
    {
        return $this->user_id === $userId;
    }
}
