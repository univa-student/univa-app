<?php

use App\Core\Middleware\ConvertKeysToCamelCase;
use App\Core\Middleware\ConvertKeysToSnakeCase;
use App\Http\Middleware\RecordMetrics;
use App\Providers\PrometheusServiceProvider;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withProviders([
        PrometheusServiceProvider::class,
    ])
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();

        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->appendToGroup('api', [
            ConvertKeysToCamelCase::class,
            ConvertKeysToSnakeCase::class,
            RecordMetrics::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
