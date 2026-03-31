<?php

namespace App\Modules\Organizer\UseCases;

use App\Modules\Organizer\Models\Note;
use Illuminate\Support\Facades\DB;

class UpdateNote
{
    public function handle(Note $note, array $data): Note
    {
        return DB::transaction(function () use ($note, $data) {
            $hasTaskIds = array_key_exists('task_ids', $data);
            $taskIds = $data['task_ids'] ?? [];
            unset($data['task_ids']);

            $note->update($data);

            if ($hasTaskIds) {
                $note->tasks()->sync($taskIds);
            }

            return $note->fresh(['tasks']);
        });
    }
}
