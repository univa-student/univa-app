<?php

namespace App\Policies\Files;

use App\Models\Files\Folder;
use App\Models\User;

class FolderPolicy
{
    public function update(User $user, Folder $folder): bool
    {
        return $user->id === $folder->user_id;
    }

    public function delete(User $user, Folder $folder): bool
    {
        return $user->id === $folder->user_id;
    }
}
