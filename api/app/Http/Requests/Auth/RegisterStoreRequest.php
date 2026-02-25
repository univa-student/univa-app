<?php

namespace App\Http\Requests\Auth;

use App\Core\Request\UnivaRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterStoreRequest extends UnivaRequest
{
    public function rules(): array
    {
        return [
            // Персональні
            'first_name' => ['required', 'string', 'min:2', 'max:60'],
            'last_name'  => ['required', 'string', 'min:2', 'max:60'],
            'middle_name'=> ['nullable', 'string', 'min:2', 'max:60'],

            // Акаунт
            'username' => ['required', 'string', 'min:3', 'max:32', 'alpha_dash', 'unique:users,username'],
            'email'    => ['required', 'string', 'email:rfc,dns', 'max:255', 'unique:users,email'],
            'phone'    => ['nullable', 'string', 'min:7', 'max:32'],

            // Навчання
            'university' => ['nullable', 'string', 'max:255'],
            'faculty'    => ['nullable', 'string', 'max:255'],
            'specialty'  => ['nullable', 'string', 'max:255'],
            'group'      => ['nullable', 'string', 'max:60'],
            'course'     => ['nullable', 'integer', 'min:1', 'max:6'],

            // Налаштування
            'language' => ['nullable', Rule::in(['uk', 'en'])],
            'timezone' => ['nullable', 'string', 'max:64'],

            // Додатково
            'referral_code' => ['nullable', 'string', 'max:64'],

            // Аватар
            'avatar' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10120'], // 5MB

            // Безпека
            'password' => ['required', 'string', 'confirmed', Password::min(8)],

            // Згоди
            'agree_terms' => ['required', 'boolean', 'accepted'],
            'marketing_opt_in' => ['nullable', 'boolean'],
        ];
    }

    public function authorize(): true
    {
        return true;
    }
}
