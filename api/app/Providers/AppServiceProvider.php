<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Files\File;
use App\Models\Files\Folder;
use App\Models\Schedule\ExamEvent;
use App\Models\Schedule\ScheduleLesson;
use App\Models\Schedule\Subject;
use App\Modules\Ai\Context\Builders\FileSummaryContextBuilder;
use App\Modules\Ai\Events\AiRunCompleted;
use App\Modules\Ai\Events\AiRunFailed;
use App\Modules\Ai\Events\AiRunRequested;
use App\Modules\Ai\Formatters\SummaryArtifactFormatter;
use App\Modules\Ai\Listeners\LogAiUsage;
use App\Modules\Ai\Listeners\UpdateAiRunStatus;
use App\Modules\Ai\Models\AiContextSession;
use App\Modules\Ai\Policies\AiContextSessionPolicy;
use App\Modules\Ai\Support\AiAttachmentFactory;
use App\Modules\Ai\Support\AiModelResolver;
use App\Modules\Ai\Support\AiResponseExtractor;
use App\Modules\Ai\Support\AiRunRecorder;
use App\Policies\Files\FilePolicy;
use App\Policies\Files\FolderPolicy;
use App\Policies\Schedule\ExamEventPolicy;
use App\Policies\Schedule\ScheduleLessonPolicy;
use App\Policies\Schedule\SubjectPolicy;
use App\Services\Files\LocalStorageAdapter;
use App\Services\Files\StorageServiceInterface;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(StorageServiceInterface::class, LocalStorageAdapter::class);

        // AI Support
        $this->app->singleton(AiModelResolver::class);
        $this->app->singleton(AiAttachmentFactory::class);
        $this->app->singleton(AiResponseExtractor::class);
        $this->app->singleton(AiRunRecorder::class);

        // AI Builders / Formatters
        $this->app->singleton(FileSummaryContextBuilder::class, function ($app) {
            return new FileSummaryContextBuilder(
                $app->make(File::class),
            );
        });

        $this->app->singleton(SummaryArtifactFormatter::class, function ($app) {
            return new SummaryArtifactFormatter(
                $app->make(AiResponseExtractor::class),
            );
        });
    }

    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('ai', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Schedule module policies
        Gate::policy(Subject::class, SubjectPolicy::class);
        Gate::policy(ScheduleLesson::class, ScheduleLessonPolicy::class);
        Gate::policy(ExamEvent::class, ExamEventPolicy::class);

        // Files module policies
        Gate::policy(File::class, FilePolicy::class);
        Gate::policy(Folder::class, FolderPolicy::class);

        // AI module policies
        Gate::policy(AiContextSession::class, AiContextSessionPolicy::class);

        // AI events
        Event::listen(AiRunRequested::class, UpdateAiRunStatus::class);
        Event::listen(AiRunCompleted::class, UpdateAiRunStatus::class);
        Event::listen(AiRunCompleted::class, LogAiUsage::class);
        Event::listen(AiRunFailed::class, UpdateAiRunStatus::class);
    }
}
