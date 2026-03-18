<?php

use App\Modules\User\Http\Controllers\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Files\FileController;
use App\Http\Controllers\Files\FolderController;
use App\Http\Controllers\Deadlines\DeadlineController;
use App\Http\Controllers\Schedule\DictionaryController;
use App\Http\Controllers\Schedule\ExamEventController;
use App\Http\Controllers\Schedule\ScheduleController;
use App\Http\Controllers\Schedule\ScheduleExceptionController;
use App\Http\Controllers\Schedule\ScheduleLessonController;
use App\Http\Controllers\Schedule\SubjectController;
use App\Http\Controllers\Settings\SettingsController;
use App\Http\Controllers\System\HealthController;
use App\Http\Controllers\System\User\MeController;
use App\Modules\Ai\Http\Controllers\SummarizeFileController;
use Illuminate\Support\Facades\Route;

$authMode = env('API_AUTH_MODE', 'hybrid');
// cookie | token | hybrid

$authMiddleware = ['throttle:api'];
$publicMiddleware = [];

switch ($authMode) {
    case 'cookie':
        // Для stateful SPA через cookies / session / CSRF
        $authMiddleware[] = 'web';
        $authMiddleware[] = 'auth:sanctum';

        $publicMiddleware[] = 'web';
        break;

    case 'token':
        // Для Bearer token без сесій і cookie
        $authMiddleware[] = 'auth:sanctum';
        break;

    case 'hybrid':
    default:
        // Sanctum сам спробує cookie/session, а потім token
        $authMiddleware[] = 'web';
        $authMiddleware[] = 'auth:sanctum';

        // public routes з web потрібні тільки якщо на них є CSRF/session сценарії
        $publicMiddleware[] = 'web';
        break;
}

Route::group(['middleware' => $authMiddleware, 'prefix' => '/v1'], function () {

    // ── Account ───────────────────────────────────────────────────────────────
    Route::group(['prefix' => '/me'], function () {
        Route::controller(MeController::class)->group(function () {
            Route::get('/univa-user', 'user');
            Route::get('/settings', 'settings');
        });

        Route::controller(UserController::class)->group(function () {
            Route::patch('/profile', 'update');
            Route::post('/password', 'changePassword');
            Route::post('/avatar', 'uploadAvatar');
            Route::delete('/avatar', 'deleteAvatar');
        });
    });

    Route::post('/logout', [LogoutController::class, 'store']);

    // ── Settings ──────────────────────────────────────────────────────────────
    Route::controller(SettingsController::class)->prefix('/settings')->group(function () {
        Route::get('/', 'index');
        Route::patch('/', 'bulkUpdate');
        Route::patch('/{key}', 'update')->where('key', '.+');
    });

    // ── Schedule module ───────────────────────────────────────────────────────

    // Deadlines
    Route::get('deadlines/stats', [DeadlineController::class, 'stats']);
    Route::apiResource('deadlines', DeadlineController::class);

    // Built schedule (lessons + exams merged)
    Route::get('/schedule', [ScheduleController::class, 'index']);

    // Subjects
    Route::controller(SubjectController::class)->prefix('/subjects')->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::patch('/{subject}', 'update');
        Route::delete('/{subject}', 'destroy');
        Route::get('/{subject}/folder', 'folder');
    });

    // Schedule lesson rules
    Route::controller(ScheduleLessonController::class)->prefix('/schedule-lessons')->group(function () {
        Route::get('/{lesson}', 'show');
        Route::get('/{lesson}/materials', 'materials');
        Route::post('/', 'store');
        Route::patch('/{lesson}', 'update');
        Route::delete('/{lesson}', 'destroy');
    });

    // Exceptions
    Route::controller(ScheduleExceptionController::class)->group(function () {
        Route::post('/schedule-lessons/{lesson}/exceptions', 'store');
        Route::delete('/exceptions/{exception}', 'destroy');
    });

    // Exam events
    Route::controller(ExamEventController::class)->prefix('/exams')->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::patch('/{exam}', 'update');
        Route::delete('/{exam}', 'destroy');
    });

    // ── Files module ─────────────────────────────────────────────────────────

    // Files
    Route::controller(FileController::class)->group(function () {
        Route::get('/storage/info', 'storageInfo');

        Route::prefix('/files')->group(function () {
            Route::get('/search', 'search');
            Route::get('/recent', 'recent');
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{file}', 'show');
            Route::get('/{file}/download', 'download');
            Route::patch('/{file}', 'update');
            Route::delete('/{file}', 'destroy');
        });
    });

    // Folders
    Route::controller(FolderController::class)->prefix('/folders')->group(function () {
        Route::get('/tree', 'tree');
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::patch('/{folder}', 'update');
        Route::delete('/{folder}', 'destroy');
    });

    // AI Summaries
    Route::controller(SummarizeFileController::class)->group(function () {
        Route::get('/summaries', 'index');
        Route::get('/summaries/{artifact}', 'show');
        Route::delete('/summaries/{artifact}', 'destroy');
        Route::post('/{file}/summary', 'store');
    });
});

Route::group(['prefix' => '/v1', 'middleware' => $publicMiddleware], function () {
    Route::get('/health', [HealthController::class, 'health']);

    Route::post('/register', [RegisterController::class, 'store']);
    Route::post('/login', [LoginController::class, 'store']);

    // ── Dictionaries (public, cacheable on frontend) ──────────────────────────
    Route::controller(DictionaryController::class)->prefix('/dictionaries')->group(function () {
        Route::get('/lesson-types', 'lessonTypes');
        Route::get('/delivery-modes', 'deliveryModes');
        Route::get('/exam-types', 'examTypes');
        Route::get('/recurrence-rules', 'recurrenceRules');
    });
});
