<?php

namespace App\Http\Controllers\Auth;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function store(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ApiResponse::ok(
            message: __('Ви вийшли з системи'),
        );
    }
}
