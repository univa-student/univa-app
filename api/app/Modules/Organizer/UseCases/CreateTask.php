<?php

namespace App\Modules\Organizer\UseCases;

use App\Models\User;
use App\Modules\Organizer\Models\Task;
use Illuminate\Support\Carbon;

class CreateTask
{
    public function handle(User $user, array $data): Task
    {
        $task = new Task();
        $task->fill($data);
        $task->user_id = $user->id;

        if ($task->status === Task::STATUS_DONE && $task->completed_at === null) {
            $task->completed_at = Carbon::now();
        }

        if ($task->status !== Task::STATUS_DONE) {
            $task->completed_at = null;
        }

        $task->save();

        return $task->fresh();
    }
}
