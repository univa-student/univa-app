<?php

namespace App\Http\Requests\Auth;

use App\Core\Request\UnivaRequest;
use Illuminate\Validation\Rules\Password;

class RegisterStoreRequest extends UnivaRequest
{
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'min:2', 'max:60'],
            'last_name' => ['required', 'string', 'min:2', 'max:60'],
            'middle_name' => ['required', 'string', 'min:2', 'max:60'],
            'email' => ['required', 'string', 'email:rfc,dns', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)],
        ];
    }

    public function authorize(): true
    {
        return true;
    }
}
