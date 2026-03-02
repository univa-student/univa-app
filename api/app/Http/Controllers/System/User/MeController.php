<?php

namespace App\Http\Controllers\System\User;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\UserResource;
use App\Models\Application\Settings\ApplicationUserSetting;
use Illuminate\Http\JsonResponse;

class MeController extends Controller
{
    public function user(): JsonResponse
    {
        $user = auth()->user();

        return ApiResponse::make(
            state: ResponseState::OK,
            data: UserResource::make($user),
        );
    }

    public function settings(): JsonResponse
    {
        $settings = ApplicationUserSetting::query()
            ->where('user_id', auth()->id())
            ->get();

        return ApiResponse::make(
            state: ResponseState::OK,
            data: $settings,
        );
    }
}
