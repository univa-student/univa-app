<?php

namespace App\Modules\Organizer\UseCases;

use App\Modules\Organizer\Models\Note;

class SetNotePinnedState
{
    public function handle(Note $note, bool $isPinned): Note
    {
        $note->update([
            'is_pinned' => $isPinned,
        ]);

        return $note->fresh(['tasks']);
    }
}
