<?php

use App\Modules\Ai\Http\Controllers\SummarizeFileController;
use App\Modules\Auth\Http\Controllers\LoginController;
use App\Modules\Auth\Http\Controllers\LogoutController;
use App\Modules\Auth\Http\Controllers\MeController;
use App\Modules\Auth\Http\Controllers\RegisterController;
use App\Modules\Auth\Http\Controllers\SessionController;
use App\Modules\Deadlines\Http\Controllers\DeadlineController;
use App\Modules\Files\Http\Controllers\FileController;
use App\Modules\Files\Http\Controllers\FolderController;
use App\Modules\Notification\Http\Controllers\NotificationController;
use App\Modules\Profiles\Http\Controllers\ProfileController;
use App\Modules\Profiles\Http\Controllers\UniversityController;
use App\Modules\Schedule\Http\Controllers\DictionaryController;
use App\Modules\Schedule\Http\Controllers\ExamEventController;
use App\Modules\Schedule\Http\Controllers\ScheduleController;
use App\Modules\Schedule\Http\Controllers\ScheduleExceptionController;
use App\Modules\Schedule\Http\Controllers\ScheduleLessonController;
use App\Modules\Settings\Http\Controllers\SettingsController;
use App\Modules\Subjects\Http\Controllers\SubjectController;
use App\Modules\System\HealthController;
use App\Modules\User\Http\Controllers\FriendshipController;
use App\Modules\User\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

$authMode = env('API_AUTH_MODE', 'hybrid');
// cookie | token | hybrid

$authMiddleware = ['throttle:api'];
$publicMiddleware = [];

switch ($authMode) {
    case 'cookie':
    case 'cookies':
        // Для stateful SPA через cookies / session / CSRF
        $authMiddleware[] = 'auth:web';

        break;

    case 'token':
        // Для Bearer token без сесій і cookie
        $authMiddleware[] = 'auth:sanctum';
        $authMiddleware[] = 'api';

        $publicMiddleware[] = [];
        break;

    case 'hybrid':
    default:
        // Sanctum сам спробує cookie/session, а потім token
        $authMiddleware[] = 'auth:sanctum';

        // public routes з web потрібні тільки якщо на них є CSRF/session сценарії
        break;
}

Route::group(['middleware' => $authMiddleware, 'prefix' => '/v1'], function () {

    // ── Account ───────────────────────────────────────────────────────────────
    Route::group(['prefix' => '/me'], function () {
        Route::controller(MeController::class)->group(function () {
            Route::get('/univa-user', 'user');
            Route::get('/settings', 'settings');
        });

        Route::controller(ProfileController::class)->group(function () {
            Route::get('/profile', 'show');
            Route::patch('/profile/details', 'update');
        });

        Route::controller(UniversityController::class)->prefix('/profile/university')->group(function () {
            Route::get('/', 'current');
            Route::post('/', 'store');
            Route::delete('/', 'destroy');
            Route::get('/information', 'information');
            Route::post('/select-region', 'selectRegion');
            Route::post('/select', 'selectUniversity');
        });

        Route::controller(UserController::class)->group(function () {
            Route::patch('/profile', 'update');
            Route::post('/password', 'changePassword');
            Route::post('/avatar', 'uploadAvatar');
            Route::delete('/avatar', 'deleteAvatar');
        });

        Route::controller(FriendshipController::class)->group(function () {
            Route::get('/friends', 'index');
            Route::get('/friends/pending', 'pending');
            Route::get('/friends/search', 'search');
            Route::get('/users/{user}/friendship', 'status');
            Route::post('/users/{user}/friends', 'store');
            Route::patch('/friends/{user}/accept', 'accept');
            Route::delete('/friends/{user}', 'destroy');
        });

        Route::controller(SessionController::class)->group(function () {
            Route::get('/sessions', 'index');
            Route::delete('/sessions/{sessionId}', 'destroy');
        });
    });

    Route::post('/logout', [LogoutController::class, 'store']);
    Route::get('/profiles/{user:username}', [ProfileController::class, 'showUser']);

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

    // ── Notifications ─────────────────────────────────────────────────────────
    Route::controller(NotificationController::class)->prefix('/notifications')->group(function () {
        Route::get('/', 'index');
        Route::patch('/read-all', 'markAllAsRead');
        Route::patch('/{notification}/read', 'markAsRead');
        Route::delete('/{notification}', 'destroy');
    });

    // ── Profiles ──────────────────────────────────────────────────────────────

    Route::get('/information', [
        UniversityController::class,
        'information'
    ]);

    Route::post('/select-region', [
        UniversityController::class,
        'selectRegion'
    ]);

    Route::post('/select-university', [
        UniversityController::class,
        'selectUniversity'
    ]);

    Route::post('/save-university', [
        UniversityController::class,
        'store'
    ]);
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
