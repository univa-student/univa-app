<?php

namespace App\Modules\Deadlines\UseCases;

use App\Modules\Deadlines\Models\Deadline;
use Illuminate\Support\Facades\DB;
use Throwable;

class UpdateDeadline
{
    /**
     * @param Deadline $deadline
     * @param array $data Validated updates
     * @return Deadline
     * @throws Throwable
     */
    public function handle(Deadline $deadline, array $data): Deadline
    {
        return DB::transaction(function () use ($deadline, $data) {
            // If the status is changing to COMPLETED, and it wasn't before
            if (
                isset($data['status']) &&
                $data['status'] === Deadline::STATUS_COMPLETED &&
                $deadline->status !== Deadline::STATUS_COMPLETED
            ) {
                // If they didn't explicitly provide a completed_at time, put 'now'
                if (!isset($data['completed_at'])) {
                    $deadline->completed_at = now();
                }
            }
            // If status is changed from completed to something else, clear completed_at
            elseif (
                isset($data['status']) &&
                $data['status'] !== Deadline::STATUS_COMPLETED &&
                $deadline->status === Deadline::STATUS_COMPLETED
            ) {
                $deadline->completed_at = null;
            }

            $deadline->update($data);

            if (array_key_exists('file_ids', $data)) {
                $deadline->files()->sync($data['file_ids']);
            }

            return $deadline->fresh();
        });
    }
}
