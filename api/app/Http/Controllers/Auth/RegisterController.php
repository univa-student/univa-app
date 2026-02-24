<?php

namespace App\Http\Controllers\Auth;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterStoreRequest;
use App\Http\Resources\Auth\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function store(RegisterStoreRequest $request)
    {
        $data = $request->validated();

        $user = User::query()
            ->create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'middle_name' => $data['middle_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

        auth()->login($user);

        $request->session()->regenerate();

        return ApiResponse::make(
            state: ResponseState::Created,
            message: __('Ви успішно зареєструвались! Команда Univa Вітає вас, та бажає успіхів!'),
            data: UserResource::make($user)
        );
    }
}
