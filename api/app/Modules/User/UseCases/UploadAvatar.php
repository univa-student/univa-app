<?php

declare(strict_types=1);

namespace App\Modules\User\UseCases;

use App\Models\User;
use App\Modules\User\Contracts\UserUseCaseContract;
use App\Modules\User\DTO\UploadAvatarData;
use App\Modules\User\Exceptions\UserUpdateException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use Throwable;

final readonly class UploadAvatar implements UserUseCaseContract
{
    /**
     * @throws Throwable
     * @throws UserUpdateException
     */
    public function handle(object $data): User
    {
        if (!$data instanceof UploadAvatarData) {
            throw new InvalidArgumentException(sprintf(
                'Expected %s, got %s',
                UploadAvatarData::class,
                get_debug_type($data)
            ));
        }

        try {
            $user = User::query()->findOrFail($data->userId);

            if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
                Storage::disk('public')->delete($user->avatar_path);
            }

            $path = $data->avatar->store('avatars', 'public');

            $user->update(['avatar_path' => $path]);

            return $user;
        } catch (ModelNotFoundException $e) {
            throw UserUpdateException::couldNotUpdate('Користувача не знайдено.');
        } catch (Throwable $e) {
            throw UserUpdateException::unknownError();
        }
    }
}
