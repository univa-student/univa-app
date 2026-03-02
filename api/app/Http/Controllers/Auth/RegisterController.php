<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Application\CreateApplicationAction;
use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterStoreRequest;
use App\Http\Resources\Auth\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Throwable;

class RegisterController extends Controller
{
    /**
     * @throws Throwable
     */
    public function store(RegisterStoreRequest $request)
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

            (new CreateApplicationAction())
                ->handle($user->id);

            $request->session()->regenerate();

        DB::commit();

        return ApiResponse::make(
            state: ResponseState::Created,
            message: __('Ви успішно зареєструвались! Команда Univa Вітає вас, та бажає успіхів!'),
            data: UserResource::make($user)
        );
    }
}
