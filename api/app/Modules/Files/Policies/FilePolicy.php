<?php

namespace App\Modules\Files\Policies;

use App\Modules\Files\Models\File;
use App\Models\User;

class FilePolicy
{
    public function view(User $user, File $file): bool
    {
        return $user->id === $file->user_id;
    }

    public function update(User $user, File $file): bool
    {
        return $user->id === $file->user_id;
    }

    public function delete(User $user, File $file): bool
    {
        return $user->id === $file->user_id;
    }

    public function download(User $user, File $file): bool
    {
        return $user->id === $file->user_id;
    }
}
