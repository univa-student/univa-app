<?php

use App\Core\Middleware\ConvertKeysToCamelCase;
use App\Core\Middleware\ConvertKeysToSnakeCase;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withSchedule(function (Schedule $schedule): void {
        $schedule
            ->command('ai:daily-digest')
            ->dailyAt('06:00')
            ->timezone(config('app.timezone'));
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();

        $middleware->appendToGroup('api', [
            ConvertKeysToCamelCase::class,
            ConvertKeysToSnakeCase::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
