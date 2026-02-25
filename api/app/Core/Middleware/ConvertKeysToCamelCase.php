<?php

namespace App\Core\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ConvertKeysToCamelCase
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        if ($response instanceof JsonResponse) {
            $responseData = $response->getData(true);
            $convertedData = $this->convertKeysToCamelCase($responseData);

            $response->setData($convertedData);
        }

        return $response;
    }

    private function convertKeysToCamelCase($data): array
    {
        $convertedData = [];

        foreach ($data as $key => $value) {
            $newKey = Str::camel($key);

            if (is_array($value)) {
                $value = $this->convertKeysToCamelCase($value);
            }

            $convertedData[$newKey] = $value;
        }

        return $convertedData;
    }
}
