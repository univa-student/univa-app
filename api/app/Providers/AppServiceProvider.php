<?php

namespace App\Providers;

use App\Models\Files\File;
use App\Models\Files\Folder;
use App\Models\Schedule\ExamEvent;
use App\Models\Schedule\ScheduleLesson;
use App\Models\Schedule\Subject;
use App\Policies\Files\FilePolicy;
use App\Policies\Files\FolderPolicy;
use App\Policies\Schedule\ExamEventPolicy;
use App\Policies\Schedule\ScheduleLessonPolicy;
use App\Policies\Schedule\SubjectPolicy;
use App\Services\Files\LocalStorageAdapter;
use App\Services\Files\StorageServiceInterface;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(StorageServiceInterface::class, LocalStorageAdapter::class);
    }

    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Schedule module policies
        Gate::policy(Subject::class, SubjectPolicy::class);
        Gate::policy(ScheduleLesson::class, ScheduleLessonPolicy::class);
        Gate::policy(ExamEvent::class, ExamEventPolicy::class);

        // Files module policies
        Gate::policy(File::class, FilePolicy::class);
        Gate::policy(Folder::class, FolderPolicy::class);
    }
}

