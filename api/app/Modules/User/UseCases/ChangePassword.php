<?php

declare(strict_types=1);

namespace App\Modules\User\UseCases;

use App\Models\User;
use App\Modules\User\Contracts\UserUseCaseContract;
use App\Modules\User\DTO\ChangePasswordData;
use App\Modules\User\Exceptions\UserUpdateException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Hash;
use InvalidArgumentException;
use Throwable;

final readonly class ChangePassword implements UserUseCaseContract
{
    /**
     * @throws Throwable
     * @throws UserUpdateException
     */
    public function handle(object $data): User
    {
        if (!$data instanceof ChangePasswordData) {
            throw new InvalidArgumentException(sprintf(
                'Expected %s, got %s',
                ChangePasswordData::class,
                get_debug_type($data)
            ));
        }

        try {
            $user = User::query()->findOrFail($data->userId);

            $user->update([
                'password' => Hash::make($data->password),
            ]);

            return $user;
        } catch (ModelNotFoundException $e) {
            throw UserUpdateException::couldNotUpdate('Користувача не знайдено.');
        } catch (Throwable $e) {
            throw UserUpdateException::unknownError();
        }
    }
}
