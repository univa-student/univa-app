<?php

namespace App\Modules\Files\Services;

use App\Modules\Files\Models\File;
use App\Modules\Files\Models\Folder;

class FolderService
{
    /**
     * List folders for a user, optionally within a parent.
     *
     * @return Folder[]
     */
    public function list(int $userId, ?int $parentId = null): array
    {
        $query = Folder::query()
            ->where('user_id', $userId)
            ->whereNull('group_id');

        if ($parentId !== null) {
            $query->where('parent_id', $parentId);
        } else {
            $query->whereNull('parent_id');
        }

        return $query
            ->orderBy('name')
            ->get()
            ->all();
    }

    /**
     * Load the full folder tree for a user (recursive children + files) in ONE query.
     */
    public function tree(int $userId): array
    {
        // Папки верхнього рівня (дерево)
        $folders = Folder::query()
            ->where('user_id', $userId)
            ->whereNull('group_id')
            ->whereNull('parent_id')
            ->with([
                'recursiveChildren',
                'files',
            ])
            ->orderBy('name')
            ->get();

        // Файли в корені (не в папці)
        $rootFiles = File::query()
            ->where('user_id', $userId)
            ->whereNull('group_id')
            ->whereNull('folder_id')
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->get();

        return [
            'folders' => $folders->toArray(),
            'files'   => $rootFiles->toArray(),
        ];
    }

    /**
     * Create a new folder.
     */
    public function create(
        int $userId,
        string $name,
        ?int $parentId = null,
        ?int $subjectId = null,
        ?int $groupId = null,
        ?int $groupSubjectId = null,
    ): Folder
    {
        return Folder::create([
            'user_id'    => $userId,
            'parent_id'  => $parentId,
            'subject_id' => $subjectId,
            'group_id' => $groupId,
            'group_subject_id' => $groupSubjectId,
            'name'       => $name,
        ]);
    }

    /**
     * Rename a folder.
     */
    public function rename(Folder $folder, string $name): Folder
    {
        $folder->update(['name' => $name]);
        return $folder->fresh();
    }

    /**
     * Move a folder to a different parent.
     */
    public function move(Folder $folder, ?int $parentId): Folder
    {
        $folder->update(['parent_id' => $parentId]);
        return $folder->fresh();
    }

    /**
     * Delete a folder (soft-delete cascades to children via app logic).
     */
    public function delete(Folder $folder): void
    {
        // Recursively soft-delete child folders
        foreach ($folder->children as $child) {
            $this->delete($child);
        }

        // Soft-delete files inside this folder
        $folder->files()->delete();

        // Soft-delete the folder itself
        $folder->delete();
    }
}
