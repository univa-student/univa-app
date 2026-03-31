<?php

namespace App\Modules\Organizer\UseCases;

use App\Modules\Organizer\Models\Task;
use Illuminate\Support\Carbon;

class UpdateTask
{
    public function handle(Task $task, array $data): Task
    {
        $nextStatus = $data['status'] ?? $task->status;

        if ($nextStatus === Task::STATUS_DONE && !array_key_exists('completed_at', $data) && $task->status !== Task::STATUS_DONE) {
            $data['completed_at'] = Carbon::now();
        }

        if ($nextStatus !== Task::STATUS_DONE && !array_key_exists('completed_at', $data)) {
            $data['completed_at'] = null;
        }

        $task->update($data);

        return $task->fresh();
    }
}
