<?php

declare(strict_types=1);

namespace App\Modules\User\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Modules\User\Http\Requests\ChangePasswordRequest;
use App\Modules\User\Http\Requests\DeleteAvatarRequest;
use App\Modules\User\Http\Requests\UpdateUserRequest;
use App\Modules\User\Http\Requests\UploadAvatarRequest;
use App\Modules\User\Http\Resources\UserResource;
use App\Modules\User\UseCases\ChangePassword;
use App\Modules\User\UseCases\DeleteAvatar;
use App\Modules\User\UseCases\UpdateUser;
use App\Modules\User\UseCases\UploadAvatar;
use App\Modules\Notification\Support\Notifier;
use App\Modules\Notification\Enums\NotificationType;
use Illuminate\Http\JsonResponse;
use Throwable;

class UserController extends Controller
{
    /**
     * @throws Throwable
     */
    public function update(
        UpdateUserRequest $request,
        UpdateUser $useCase,
    ): JsonResponse {
        $user = $useCase->handle($request->toDto());

        Notifier::send($user->id, NotificationType::PROFILE_UPDATED, [
            'message' => 'Ваш профіль було оновлено.'
        ]);

        return ApiResponse::make(
            state: ResponseState::OK,
            message: 'Профіль користувача успішно оновлено.',
            data: new UserResource($user),
        );
    }

    /**
     * @throws Throwable
     */
    public function changePassword(
        ChangePasswordRequest $request,
        ChangePassword $useCase,
    ): JsonResponse {
        $useCase->handle($request->toDto());

        Notifier::send($request->user()->id, NotificationType::PASSWORD_CHANGED, [
            'message' => 'Пароль до вашого акаунту було змінено.'
        ]);

        return ApiResponse::make(
            state: ResponseState::OK,
            message: 'Пароль успішно змінено.',
        );
    }

    /**
     * @throws Throwable
     */
    public function uploadAvatar(
        UploadAvatarRequest $request,
        UploadAvatar $useCase,
    ): JsonResponse {
        $user = $useCase->handle($request->toDto());

        Notifier::send($user->id, NotificationType::AVATAR_UPDATED, [
            'message' => 'Ваш аватар успішно оновлено.'
        ]);

        return ApiResponse::make(
            state: ResponseState::OK,
            message: 'Аватар успішно оновлено.',
            data: new UserResource($user),
        );
    }

    /**
     * @throws Throwable
     */
    public function deleteAvatar(
        DeleteAvatarRequest $request,
        DeleteAvatar $useCase,
    ): JsonResponse {
        $user = $useCase->handle($request->toDto());

        Notifier::send($user->id, NotificationType::AVATAR_UPDATED, [
            'message' => 'Ваш аватар видалено.'
        ]);

        return ApiResponse::make(
            state: ResponseState::OK,
            message: 'Аватар видалено.',
            data: new UserResource($user),
        );
    }
}
