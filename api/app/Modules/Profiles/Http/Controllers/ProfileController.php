<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Support\Notifier;
use App\Modules\Profiles\Http\Requests\UpdateProfileRequest;
use App\Modules\Profiles\Http\Resources\ProfileResource;
use App\Modules\Profiles\Services\ProfileService;
use App\Modules\Profiles\UseCases\UpdateProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request, ProfileService $profiles): JsonResponse
    {
        $profile = $profiles->getForUser($request->user());

        return ApiResponse::data(new ProfileResource($profile));
    }

    public function showUser(User $user, ProfileService $profiles): JsonResponse
    {
        try {
            $profile = $profiles->publicForUser($user, request()->user());
        } catch (UnivaHttpException $e) {
            return $e->render();
        }

        return ApiResponse::data(new ProfileResource($profile));
    }

    public function update(
        UpdateProfileRequest $request,
        UpdateProfile $useCase,
    ): JsonResponse {
        $profile = $useCase->handle($request->user(), $request->toDto());

        Notifier::send($request->user()->id, NotificationType::PROFILE_UPDATED, [
            'message' => 'Ваш студентський профіль оновлено.',
        ]);

        return ApiResponse::ok(
            message: 'Профіль оновлено.',
            data: new ProfileResource($profile),
        );
    }
}
