<?php

namespace App\Modules\Organizer\UseCases;

use App\Modules\Organizer\Models\Note;
use Illuminate\Support\Carbon;

class SetNoteArchivedState
{
    public function handle(Note $note, bool $archived): Note
    {
        $note->update([
            'archived_at' => $archived ? Carbon::now() : null,
        ]);

        return $note->fresh(['tasks']);
    }
}
