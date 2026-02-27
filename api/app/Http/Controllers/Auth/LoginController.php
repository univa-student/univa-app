<?php

namespace App\Http\Controllers\Auth;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\UserResource;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function store(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials)) {
            return ApiResponse::error(
                state: ResponseState::Unauthorized,
                message: __('Невірний email або пароль'),
            );
        }

        return ApiResponse::ok(
            message: __('Ви успішно увійшли!'),
            data: UserResource::make($request->user()),
        );
    }
}
