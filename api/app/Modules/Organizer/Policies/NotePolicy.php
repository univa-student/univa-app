<?php

namespace App\Modules\Organizer\Policies;

use App\Models\User;
use App\Modules\Organizer\Models\Note;

class NotePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Note $note): bool
    {
        return $user->id === $note->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Note $note): bool
    {
        return $user->id === $note->user_id;
    }

    public function delete(User $user, Note $note): bool
    {
        return $user->id === $note->user_id;
    }
}
