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

        $avatarPath = '';
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $fullName = trim(
            ($data['last_name'] ?? '') . ' ' .
            ($data['first_name'] ?? '') . ' ' .
            ($data['middle_name'] ?? '')
        );

        $user = User::query()->create([
            // Персональні
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'middle_name' => $data['middle_name'] ?? null,
            'full_name' => $fullName !== '' ? $fullName : null,

            // Акаунт
            'username' => $data['username'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,

            // Навчання
            'university' => $data['university'] ?? null,
            'faculty' => $data['faculty'] ?? null,
            'specialty' => $data['specialty'] ?? null,
            'group' => $data['group'] ?? null,
            'course' => $data['course'] ?? null,

            // Налаштування
            'language' => $data['language'] ?? 'uk',
            'timezone' => $data['timezone'] ?? 'Europe/Zaporozhye',

            // Додатково
            'referral_code' => $data['referral_code'] ?? null,

            // Аватар
            'avatar_path' => $avatarPath,

            // Згоди
            'agree_terms' => (bool)($data['agree_terms'] ?? false),
            'marketing_opt_in' => (bool)($data['marketing_opt_in'] ?? false),

            // Безпека
            'password' => Hash::make($data['password']),
        ]);

        auth()->login($user);

        return ApiResponse::make(
            state: ResponseState::Created,
            message: __('Ви успішно зареєструвались! Команда Univa Вітає вас, та бажає успіхів!'),
            data: UserResource::make($user)
        );
    }
}
