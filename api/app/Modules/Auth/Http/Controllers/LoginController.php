<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Modules\Auth\Http\Requests\LoginRequest;
use App\Modules\Auth\Http\Resources\UserResource;
use App\Modules\Auth\Services\SessionMetadataService;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function store(LoginRequest $request, SessionMetadataService $sessionMetadataService)
    {
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials)) {
            return ApiResponse::error(
                state: ResponseState::Unauthorized,
                message: 'Невірний email або пароль',
            );
        }

        $request->session()->regenerate();
        $sessionMetadataService->sync($request);

        return ApiResponse::ok(
            message: 'Ви успішно увійшли!',
            data: UserResource::make($request->user()),
        );
    }
}
