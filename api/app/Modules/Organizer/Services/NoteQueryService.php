<?php

namespace App\Modules\Organizer\Services;

use App\Models\User;
use App\Modules\Organizer\Models\Note;
use Illuminate\Database\Eloquent\Builder;

class NoteQueryService
{
    public function getFilteredNotes(User $user, array $filters = []): Builder
    {
        $query = Note::ownedBy($user->id)
            ->with('tasks');

        $archived = $filters['archived'] ?? null;
        if ($archived === null || $archived === '' || $archived === '0' || $archived === false) {
            $query->whereNull('archived_at');
        } elseif ($archived === '1' || $archived === true) {
            $query->whereNotNull('archived_at');
        }

        if (!empty($filters['pinned'])) {
            $query->where('is_pinned', filter_var($filters['pinned'], FILTER_VALIDATE_BOOL));
        }

        if (!empty($filters['subject_id'])) {
            $query->where('subject_id', (int) $filters['subject_id']);
        }

        if (!empty($filters['task_id'])) {
            $taskId = (int) $filters['task_id'];
            $query->whereHas('tasks', fn (Builder $builder) => $builder->where('tasks.id', $taskId));
        }

        if (!empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function (Builder $inner) use ($search) {
                $inner->where('title', 'like', '%' . $search . '%')
                    ->orWhere('body_markdown', 'like', '%' . $search . '%');
            });
        }

        return $query
            ->orderByDesc('is_pinned')
            ->orderByDesc('updated_at');
    }
}
