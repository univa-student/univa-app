<?php

namespace App\Modules\Organizer\Services;

use App\Models\User;
use App\Modules\Organizer\Models\Task;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class TaskQueryService
{
    public function getFilteredTasks(User $user, array $filters = []): Builder
    {
        $query = Task::ownedBy($user->id);

        if (!empty($filters['status'])) {
            $value = is_string($filters['status']) ? explode(',', $filters['status']) : (array) $filters['status'];
            $query->whereIn('status', $value);
        }

        if (!empty($filters['category'])) {
            $value = is_string($filters['category']) ? explode(',', $filters['category']) : (array) $filters['category'];
            $query->whereIn('category', $value);
        }

        if (!empty($filters['priority'])) {
            $value = is_string($filters['priority']) ? explode(',', $filters['priority']) : (array) $filters['priority'];
            $query->whereIn('priority', $value);
        }

        if (!empty($filters['search'])) {
            $search = (string) $filters['search'];
            $query->where(function (Builder $inner) use ($search) {
                $inner->where('title', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        if (!empty($filters['due_state'])) {
            $now = Carbon::now();
            $todayStart = $now->copy()->startOfDay();
            $todayEnd = $now->copy()->endOfDay();

            if ($filters['due_state'] === 'today') {
                $query->whereBetween('due_at', [$todayStart, $todayEnd]);
            } elseif ($filters['due_state'] === 'upcoming') {
                $query->where('due_at', '>', $todayEnd);
            } elseif ($filters['due_state'] === 'overdue') {
                $query->where('due_at', '<', $now)
                    ->whereNotIn('status', [Task::STATUS_DONE, Task::STATUS_CANCELLED]);
            } elseif ($filters['due_state'] === 'none') {
                $query->whereNull('due_at');
            }
        }

        if (!empty($filters['due_from'])) {
            $query->where('due_at', '>=', Carbon::parse((string) $filters['due_from'])->startOfDay());
        }

        if (!empty($filters['due_to'])) {
            $query->where('due_at', '<=', Carbon::parse((string) $filters['due_to'])->endOfDay());
        }

        $sortBy = (string) ($filters['sort_by'] ?? 'due_at');
        $sortDir = (string) ($filters['sort_dir'] ?? 'asc');

        if ($sortBy === 'priority') {
            $query->orderByRaw(
                "case priority
                    when 'critical' then 1
                    when 'high' then 2
                    when 'medium' then 3
                    when 'low' then 4
                    else 5
                end {$sortDir}"
            );
        } elseif ($sortBy === 'created_at') {
            $query->orderBy('created_at', $sortDir);
        } else {
            $query->orderByRaw('due_at is null')
                ->orderBy('due_at', $sortDir)
                ->orderBy('created_at', 'desc');
        }

        return $query;
    }
}
