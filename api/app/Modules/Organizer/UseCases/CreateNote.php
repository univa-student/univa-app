<?php

namespace App\Modules\Organizer\UseCases;

use App\Models\User;
use App\Modules\Organizer\Models\Note;
use Illuminate\Support\Facades\DB;

class CreateNote
{
    public function handle(User $user, array $data): Note
    {
        return DB::transaction(function () use ($user, $data) {
            $taskIds = $data['task_ids'] ?? [];
            unset($data['task_ids']);

            $note = new Note();
            $note->fill($data);
            $note->user_id = $user->id;
            $note->save();

            if ($taskIds !== []) {
                $note->tasks()->sync($taskIds);
            }

            return $note->fresh(['tasks']);
        });
    }
}
