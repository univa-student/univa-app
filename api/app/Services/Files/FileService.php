<?php

namespace App\Services\Files;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Enums\FileScope;
use App\Enums\FileStatus;
use App\Models\Files\File;
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
            ->where('status', FileStatus::Ready);

        if ($folderId !== null) {
            $query->where('folder_id', $folderId);
        } else {
            $query->whereNull('folder_id');
        }

        if ($subjectId !== null) {
            $query->where('subject_id', $subjectId);
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
    ): File {
        $storageKey = $this->generateStorageKey($uploadedFile);

        // 1. Create metadata record with status "uploading"
        $file = File::create([
            'user_id'       => $userId,
            'folder_id'     => $folderId,
            'subject_id'    => $subjectId,
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
                'File upload failed: ' . $e->getMessage(),
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
        $file->update([
            'size'     => $uploadedFile->getSize(),
            'checksum' => hash_file('sha256', $uploadedFile->getRealPath()),
            'status'   => FileStatus::Ready,
        ]);

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
        $file->update(['status' => FileStatus::Deleted]);
        $file->delete(); // soft delete
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
