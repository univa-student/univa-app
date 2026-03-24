<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Modules\Profiles\UseCases\InitializeProfile;
use App\Modules\Settings\UseCases\InitializeUserSettings;
use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Modules\Auth\Http\Requests\RegisterStoreRequest;
use App\Modules\Auth\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Throwable;

class RegisterController extends Controller
{
    /**
     * @throws Throwable
     */
    public function store(
        RegisterStoreRequest $request,
        InitializeUserSettings $initializeUserSettings,
        InitializeProfile $initializeProfile,
    )
    {
        $data = $request->validated();

        DB::beginTransaction();

            $user = User::query()->create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'] ?? null,

                'username' => $data['username'],
                'email' => $data['email'],

                'agree_terms' => (bool)($data['agree_terms'] ?? false),
                'marketing_opt_in' => (bool)($data['marketing_opt_in'] ?? false),

                'password' => Hash::make($data['password']),
            ]);

            auth()->login($user);

            $initializeUserSettings->handle($user->id);
            $initializeProfile->handle($user);

            $request->session()->regenerate();

        DB::commit();

        return ApiResponse::make(
            state: ResponseState::Created,
            message: __('Ви успішно зареєструвались! Команда Univa Вітає вас, та бажає успіхів!'),
            data: UserResource::make($user)
        );
    }
}
