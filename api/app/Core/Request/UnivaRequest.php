<?php

namespace App\Core\Request;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UnivaRequest extends FormRequest
{
    protected function failedValidation(Validator $validator): void
    {
        $errorsBag = $validator->errors()->toArray();

        $firstMessage = 'Виникла помилка. Будь-ласка, зверніться до служби підтримки';

        foreach ($errorsBag as $fieldErrors) {
            if (!empty($fieldErrors)) {
                $firstMessage = $fieldErrors[0];
                break;
            }
        }

        throw new HttpResponseException(
            ApiResponse::error(
                state: ResponseState::Unprocessable,
                message: $firstMessage,
                errors: $errorsBag
            )
        );
    }
}
