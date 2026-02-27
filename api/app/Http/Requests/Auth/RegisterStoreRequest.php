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
            'first_name' => ['required', 'string', 'min:2', 'max:60'],
            'last_name'=> ['nullable', 'string', 'min:2', 'max:60'],
            'username' => ['required', 'string', 'min:3', 'max:32', 'alpha_dash', 'unique:users,username'],
            'email'    => ['required', 'string', 'email:rfc,dns', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)],
            'agree_terms' => ['required', 'boolean', 'accepted'],
            'marketing_opt_in' => ['nullable', 'boolean'],
        ];
    }

    public function authorize(): true
    {
        return true;
    }
}
