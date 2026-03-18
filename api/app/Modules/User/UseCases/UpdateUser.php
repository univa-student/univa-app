<?php

declare(strict_types=1);

namespace App\Modules\User\UseCases;

use App\Models\User;
use App\Modules\User\Contracts\UserUseCaseContract;
use App\Modules\User\DTO\UpdateUserData;
use App\Modules\User\Events\UserProfileUpdated;
use App\Modules\User\Exceptions\UserUpdateException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use InvalidArgumentException;
use Throwable;

final readonly class UpdateUser implements UserUseCaseContract
{
    /**
     * @throws Throwable
     * @throws UserUpdateException
     */
    public function handle(object $data): User
    {
        if (!$data instanceof UpdateUserData) {
            throw new InvalidArgumentException(sprintf(
                'Expected %s, got %s',
                UpdateUserData::class,
                get_debug_type($data)
            ));
        }

        try {
            $user = User::query()->findOrFail($data->userId);

            $attributes = array_filter([
                'first_name' => $data->firstName,
                'last_name' => $data->lastName,
                'username' => $data->username,
            ], fn($value) => $value !== null);

            if (!empty($attributes)) {
                $user->fill($attributes);
                $user->save();

                event(new UserProfileUpdated($user));
            }

            return $user;
        } catch (ModelNotFoundException $e) {
            throw UserUpdateException::couldNotUpdate('Користувача не знайдено.');
        } catch (Throwable $e) {
            throw UserUpdateException::unknownError();
        }
    }
}
