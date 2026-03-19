<?php

namespace App\Services\Files;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class LocalStorageAdapter implements StorageServiceInterface
{
    public function put(string $key, mixed $contents, string $disk = 'local'): bool
    {
        return Storage::disk($disk)->put($key, $contents);
    }

    public function putFile(string $directory, UploadedFile $file, string $disk = 'local'): string
    {
        $path = Storage::disk($disk)->putFile($directory, $file);

        return $path ?: throw new \RuntimeException('Failed to store file.');
    }

    public function get(string $key, string $disk = 'local'): ?string
    {
        return Storage::disk($disk)->get($key);
    }

    public function stream(string $key, string $disk = 'local'): mixed
    {
        return Storage::disk($disk)->readStream($key);
    }

    public function temporaryUrl(string $key, int $expiresInMinutes = 30, string $disk = 'local'): string
    {
        // Local disk doesn't support temporaryUrl — use a signed route instead.
        return URL::temporarySignedRoute(
            'files.download.signed',
            now()->addMinutes($expiresInMinutes),
            ['key' => $key]
        );
    }

    public function delete(string $key, string $disk = 'local'): bool
    {
        return Storage::disk($disk)->delete($key);
    }

    public function exists(string $key, string $disk = 'local'): bool
    {
        return Storage::disk($disk)->exists($key);
    }

    public function size(string $key, string $disk = 'local'): int
    {
        return Storage::disk($disk)->size($key);
    }
}
