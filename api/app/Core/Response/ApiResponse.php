<?php

namespace App\Core\Response;

namespace App\Core\Response;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function make(
        ResponseState $state,
        string $message = '',
        mixed $data = null,
        mixed $errors = null,
        array $meta = []
    ): JsonResponse {
        $payload = [
            'status' => $state->value,
            'message' => $message,
        ];

        if (!is_null($data)) {
            $payload['data'] = $data;
        }

        if (!is_null($errors)) {
            $payload['errors'] = $errors;
        }

        if (!empty($meta)) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $state->value);
    }

    public static function ok(string $message = 'OK', mixed $data = null, array $meta = []): JsonResponse
    {
        return self::make(ResponseState::OK, $message, $data, null, $meta);
    }

    public static function created(string $message = 'Created', mixed $data = null, array $meta = []): JsonResponse
    {
        return self::make(ResponseState::Created, $message, $data, null, $meta);
    }

    public static function error(ResponseState $state, string $message = 'Error', mixed $errors = null, mixed $data = null): JsonResponse
    {
        return self::make($state, $message, $data, $errors);
    }
}
