<?php

namespace App\Actions\Deadlines;

use App\Models\Deadlines\Deadline;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Throwable;

class CreateDeadlineAction
{
    /**
     * @param User $user
     * @param array $data Validated data
     * @return Deadline
     * @throws Throwable
     */
    public function handle(User $user, array $data): Deadline
    {
        return DB::transaction(function () use ($user, $data) {
            $deadline = new Deadline();
            $deadline->fill($data);
            $deadline->user_id = $user->id;

            // Default status overrides if someone passes completed_at or due to logic
            if (isset($data['status']) && $data['status'] === Deadline::STATUS_COMPLETED && !isset($data['completed_at'])) {
                $deadline->completed_at = now();
            }

            $deadline->save();

            if (isset($data['file_ids'])) {
                $deadline->files()->sync($data['file_ids']);
            }

            return $deadline;
        });
    }
}
