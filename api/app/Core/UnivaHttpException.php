<?php

namespace App\Core;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use Exception;
use Illuminate\Http\JsonResponse;

class UnivaHttpException extends Exception
{
    public function __construct(
        string $message = '',
        protected ResponseState $state = ResponseState::Warning,
        protected mixed $errors = null
    ) {
        parent::__construct($message);
    }

    public function render(): JsonResponse
    {
        return ApiResponse::error(
            state: $this->state,
            message: $this->getMessage(),
            errors: $this->errors
        );
    }
}
