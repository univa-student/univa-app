<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function store(): JsonResponse
    {
        Auth::guard('web')
            ->logout();

        return ApiResponse::ok(
            message: 'Ви вийшли з системи',
        );
    }
}
