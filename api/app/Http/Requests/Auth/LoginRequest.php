<?php

namespace App\Http\Requests\Auth;

use App\Core\Request\UnivaRequest;

class LoginRequest extends UnivaRequest
{
    public function rules(): array
    {
        return [
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function authorize(): true
    {
        return true;
    }
}
