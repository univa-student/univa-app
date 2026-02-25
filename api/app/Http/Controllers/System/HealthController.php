<?php

namespace App\Http\Controllers\System;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function health(): JsonResponse
    {
        return ApiResponse::ok('pong');
    }
}
