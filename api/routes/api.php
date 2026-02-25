<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\System\HealthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['auth:sanctum', 'throttle:api'], 'prefix' => '/v1'], function () {
    Route::get('/univa-user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [LogoutController::class, 'store']);
});

Route::group(['prefix' => '/v1'], function () {
    Route::get('/health', [HealthController::class, 'health']);

    Route::post('/register', [RegisterController::class, 'store']);
    Route::post('/login', [LoginController::class, 'store']);
});
