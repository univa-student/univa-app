<?php

namespace App\Services\Deadlines;

use App\Models\Deadlines\Deadline;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class DeadlineQueryService
{
    /**
     * Get all deadlines for a user based on filters.
     */
    public function getFilteredDeadlines(User $user, array $filters = []): Builder
    {
        $query = Deadline::ownedBy($user->id)
            ->with(['subject', 'files']);

        if (!empty($filters['subject_id'])) {
            $val = is_string($filters['subject_id']) ? explode(',', $filters['subject_id']) : (array) $filters['subject_id'];
            $query->whereIn('subject_id', array_map('intval', $val));
        }

        if (!empty($filters['status'])) {
            $val = is_string($filters['status']) ? explode(',', $filters['status']) : (array) $filters['status'];
            $query->whereIn('status', $val);
        }

        if (!empty($filters['priority'])) {
            $val = is_string($filters['priority']) ? explode(',', $filters['priority']) : (array) $filters['priority'];
            $query->whereIn('priority', $val);
        }

        if (!empty($filters['type'])) {
            $val = is_string($filters['type']) ? explode(',', $filters['type']) : (array) $filters['type'];
            $query->whereIn('type', $val);
        }

        if (!empty($filters['search'])) {
            $query->where('title', 'like', '%' . $filters['search'] . '%');
        }

        // Special time-based filters as requested: today, upcoming, overdue
        if (!empty($filters['time_frame'])) {
            $now = Carbon::now();
            $todayStart = $now->copy()->startOfDay();
            $todayEnd = $now->copy()->endOfDay();

            if ($filters['time_frame'] === 'today') {
                $query->whereBetween('due_at', [$todayStart, $todayEnd])
                      ->where('status', '!=', Deadline::STATUS_COMPLETED);
            } elseif ($filters['time_frame'] === 'upcoming') {
                $query->where('due_at', '>', $todayEnd)
                      ->where('status', '!=', Deadline::STATUS_COMPLETED);
            } elseif ($filters['time_frame'] === 'overdue') {
                $query->where('due_at', '<', $now)
                      ->where('status', '!=', Deadline::STATUS_COMPLETED)
                      ->where('status', '!=', Deadline::STATUS_CANCELLED);
            }
        }
        
        // Exact date range filters (useful for calendar)
        if (!empty($filters['date_from'])) {
            $query->where('due_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }
        if (!empty($filters['date_to'])) {
            $query->where('due_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        // Sorting logic
        $sortBy = $filters['sort_by'] ?? 'due_at';
        $sortDir = $filters['sort_dir'] ?? 'asc';

        if ($sortBy === 'due_at') {
            $query->orderBy('due_at', $sortDir);
        } elseif ($sortBy === 'priority') {
            // Raw order by enum isn't always neat, but could optionally just order by priority length or specific case
            // Let's just do a normal sort on the string for now, or map it.
            $query->orderBy('priority', $sortDir);
        } elseif ($sortBy === 'created_at') {
            $query->orderBy('created_at', $sortDir);
        }

        return $query;
    }
}
