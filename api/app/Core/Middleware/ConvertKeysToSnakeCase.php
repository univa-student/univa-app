<?php

namespace App\Core\Middleware;

use Closure;
use Illuminate\Support\Str;

class ConvertKeysToSnakeCase
{
    public function handle($request, Closure $next)
    {
        $requestData = $request->all();
        $convertedData = $this->convertKeysToSnakeCase($requestData);

        $request->replace($convertedData);

        return $next($request);
    }

    private function convertKeysToSnakeCase($data): array
    {
        $convertedData = [];

        foreach ($data as $key => $value) {
            $newKey = Str::snake($key);

            if (is_array($value)) {
                $value = $this->convertKeysToSnakeCase($value);
            }

            $convertedData[$newKey] = $value;
        }

        return $convertedData;
    }
}
