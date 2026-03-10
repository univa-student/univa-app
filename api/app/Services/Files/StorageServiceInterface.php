<?php

namespace App\Services\Files;

interface StorageServiceInterface
{
    /**
     * Store a file and return its storage key.
     */
    public function put(string $key, mixed $contents, string $disk = 'local'): bool;

    /**
     * Store an uploaded file and return the storage key.
     */
    public function putFile(string $directory, \Illuminate\Http\UploadedFile $file, string $disk = 'local'): string;

    /**
     * Get file contents.
     */
    public function get(string $key, string $disk = 'local'): ?string;

    /**
     * Get a stream resource for the file.
     */
    public function stream(string $key, string $disk = 'local'): mixed;

    /**
     * Generate a temporary URL (for S3/MinIO — falls back to route for local).
     */
    public function temporaryUrl(string $key, int $expiresInMinutes = 30, string $disk = 'local'): string;

    /**
     * Delete a file from storage.
     */
    public function delete(string $key, string $disk = 'local'): bool;

    /**
     * Check if a file exists.
     */
    public function exists(string $key, string $disk = 'local'): bool;

    /**
     * Get the file size in bytes.
     */
    public function size(string $key, string $disk = 'local'): int;
}
