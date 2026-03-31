<?php

namespace App\Modules\Files\Services;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Modules\Files\Enums\FileScope;
use App\Modules\Files\Enums\FileStatus;
use App\Modules\Files\Models\File;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class FileService
{
    public function __construct(
        private readonly StorageServiceInterface $storage,
    ) {}

    // ── List ─────────────────────────────────────────────────────────────────

    /**
     * List files for a user, optionally filtered by folder/subject.
     *
     * @return File[]
     */
    public function list(int $userId, ?int $folderId = null, ?int $subjectId = null): array
    {
        $query = File::query()
            ->where('user_id', $userId)
            ->whereNull('group_id')
            ->where('status', FileStatus::Ready);

        if ($folderId !== null) {
            $query->where('folder_id', $folderId);
        } else {
            $query->whereNull('folder_id');
        }

        if ($subjectId !== null) {
            $query->where('subject_id', $subjectId);
        } else if ($folderId === null) {
            // Hide files attached to subjects from the root folder
            $query->whereNull('subject_id');
        }

        return $query
            ->orderByDesc('is_pinned')
            ->orderByDesc('updated_at')
            ->get()
            ->all();
    }

    /**
     * List recently updated files.
     *
     * @return File[]
     */
    public function recent(int $userId, int $limit = 20): array
    {
        return File::query()
            ->where('user_id', $userId)
            ->whereNull('group_id')
            ->where('status', FileStatus::Ready)
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get()
            ->all();
    }

    /**
     * Search files by name.
     *
     * @return File[]
     */
    public function search(int $userId, string $query, ?int $subjectId = null): array
    {
        $q = File::query()
            ->where('user_id', $userId)
            ->whereNull('group_id')
            ->where('status', FileStatus::Ready)
            ->where('original_name', 'ILIKE', '%' . $query . '%');

        if ($subjectId !== null) {
            $q->where('subject_id', $subjectId);
        }

        return $q
            ->orderByDesc('updated_at')
            ->limit(50)
            ->get()
            ->all();
    }

    // ── Upload lifecycle ─────────────────────────────────────────────────────

    /**
     * Upload a file: create metadata → store → finalize.
     *
     * @throws UnivaHttpException
     */
    public function upload(
        int $userId,
        UploadedFile $uploadedFile,
        ?int $folderId = null,
        ?int $subjectId = null,
        string $scope = 'personal',
        ?int $groupId = null,
        ?int $groupSubjectId = null,
    ): File {
        $user = User::findOrFail($userId);
        $fileSize = $uploadedFile->getSize();

        if ($user->storage_used + $fileSize > $user->storage_limit) {
            throw new UnivaHttpException(
                'Перевищено ліміт сховища. Ви не можете завантажити цей файл.',
                ResponseState::Forbidden,
                403
            );
        }

        $storageKey = $this->generateStorageKey($uploadedFile);

        if ($subjectId !== null && $folderId === null) {
            $subject = \App\Modules\Subjects\Models\Subject::find($subjectId);
            if ($subject && $subject->user_id === $userId) {
                // Find or create a root folder for this subject
                $folder = \App\Modules\Files\Models\Folder::firstOrCreate(
                    [
                        'user_id' => $userId,
                        'subject_id' => $subjectId,
                        'parent_id' => null,
                    ],
                    [
                        'name' => $subject->name,
                    ]
                );
                $folderId = $folder->id;
            }
        }

        if ($groupSubjectId !== null && $folderId === null) {
            $groupSubject = \App\Modules\Groups\Models\GroupSubject::find($groupSubjectId);
            if ($groupSubject !== null) {
                $folder = \App\Modules\Files\Models\Folder::firstOrCreate(
                    [
                        'user_id' => $userId,
                        'group_id' => $groupId ?? $groupSubject->group_id,
                        'group_subject_id' => $groupSubjectId,
                        'parent_id' => null,
                    ],
                    [
                        'name' => $groupSubject->name,
                    ]
                );

                $groupId ??= $groupSubject->group_id;
                $folderId = $folder->id;
            }
        }

        // 1. Create metadata record with status "uploading"
        $file = File::create([
            'user_id'       => $userId,
            'folder_id'     => $folderId,
            'subject_id'    => $subjectId,
            'group_id'      => $groupId,
            'group_subject_id' => $groupSubjectId,
            'original_name' => $uploadedFile->getClientOriginalName(),
            'mime_type'     => $uploadedFile->getMimeType(),
            'size'          => 0,
            'storage_disk'  => 'local',
            'storage_key'   => $storageKey,
            'status'        => FileStatus::Uploading,
            'scope'         => FileScope::tryFrom($scope) ?? FileScope::Personal,
        ]);

        // 2. Store the file
        try {
            $actualKey = $this->storage->putFile('files', $uploadedFile);
            $file->update(['storage_key' => $actualKey]);
        } catch (\Throwable $e) {
            $file->update(['status' => FileStatus::Failed]);
            throw new UnivaHttpException(
                'Не вдалося завантажити файл.',
                ResponseState::Error,
            );
        }

        // 3. Finalize
        return $this->finalize($file, $uploadedFile);
    }

    /**
     * Finalize: set real size, checksum, status=ready.
     */
    private function finalize(File $file, UploadedFile $uploadedFile): File
    {
        $size = $uploadedFile->getSize();

        $file->update([
            'size'     => $size,
            'checksum' => hash_file('sha256', $uploadedFile->getRealPath()),
            'status'   => FileStatus::Ready,
        ]);

        $user = User::findOrFail($file->user_id);
        $user->increment('storage_used', $size);

        return $file->fresh();
    }

    // ── Update ───────────────────────────────────────────────────────────────

    /**
     * Rename a file.
     */
    public function rename(File $file, string $name): File
    {
        $file->update(['original_name' => $name]);
        return $file->fresh();
    }

    /**
     * Move a file to another folder.
     */
    public function move(File $file, ?int $folderId): File
    {
        $file->update(['folder_id' => $folderId]);
        return $file->fresh();
    }

    /**
     * Move (attach/detach) a file to a subject.
     */
    public function moveToSubject(File $file, ?int $subjectId): File
    {
        $file->update(['subject_id' => $subjectId]);
        return $file->fresh();
    }

    public function moveToGroupSubject(File $file, ?int $groupSubjectId): File
    {
        $file->update(['group_subject_id' => $groupSubjectId]);
        return $file->fresh();
    }

    /**
     * Toggle pin status.
     */
    public function togglePin(File $file): File
    {
        $file->update(['is_pinned' => !$file->is_pinned]);
        return $file->fresh();
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    /**
     * Soft-delete file (physical deletion by policy/job later).
     */
    public function delete(File $file): void
    {
        $fileSize = $file->size;
        $userId = $file->user_id;

        $file->update(['status' => FileStatus::Deleted]);
        $file->delete(); // soft delete

        $user = User::find($userId);
        if ($user && $user->storage_used >= $fileSize) {
            $user->decrement('storage_used', $fileSize);
        }
    }

    // ── Download ─────────────────────────────────────────────────────────────

    /**
     * Get a download stream for the file.
     */
    public function downloadStream(File $file): mixed
    {
        return $this->storage->stream($file->storage_key, $file->storage_disk);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function generateStorageKey(UploadedFile $file): string
    {
        $ext = $file->getClientOriginalExtension();
        return 'files/' . date('Y/m') . '/' . Str::uuid() . ($ext ? ".{$ext}" : '');
    }
}
