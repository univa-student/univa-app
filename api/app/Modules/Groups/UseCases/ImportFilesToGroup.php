<?php

namespace App\Modules\Groups\UseCases;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Models\User;
use App\Modules\Files\Enums\FileScope;
use App\Modules\Files\Models\File;
use App\Modules\Files\Models\Folder;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupSubject;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Throwable;

class ImportFilesToGroup
{
    /**
     * @return Collection<int, File>
     *
     * @throws UnivaHttpException
     * @throws Throwable
     */
    public function handle(User $user, Group $group, array $fileIds, ?int $groupSubjectId = null): Collection
    {
        return DB::transaction(function () use ($user, $group, $fileIds, $groupSubjectId): Collection {
            $groupSubject = null;
            $folderId = null;

            if ($groupSubjectId !== null) {
                $groupSubject = GroupSubject::query()->find($groupSubjectId);

                if ($groupSubject === null || $groupSubject->group_id !== $group->id) {
                    throw new UnivaHttpException(
                        'The selected group subject does not belong to this group.',
                        ResponseState::Error,
                        422,
                    );
                }

                $folderId = Folder::query()->firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'group_id' => $group->id,
                        'group_subject_id' => $groupSubject->id,
                        'parent_id' => null,
                    ],
                    [
                        'name' => $groupSubject->name,
                    ],
                )->id;
            }

            $files = File::query()
                ->where('user_id', $user->id)
                ->whereNull('group_id')
                ->whereIn('id', $fileIds)
                ->where('status', 'ready')
                ->get();

            if ($files->count() !== count(array_unique($fileIds))) {
                throw new UnivaHttpException(
                    'Some files are unavailable for group import.',
                    ResponseState::Error,
                    422,
                );
            }

            foreach ($files as $file) {
                $file->update([
                    'group_id' => $group->id,
                    'group_subject_id' => $groupSubject?->id,
                    'subject_id' => null,
                    'folder_id' => $folderId,
                    'scope' => FileScope::Group,
                ]);
            }

            return $files->fresh(['user', 'groupSubject']);
        });
    }
}
