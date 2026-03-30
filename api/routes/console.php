<?php

use App\Models\User;
use App\Modules\Ai\DTO\GenerateDailyDigestData;
use App\Modules\Ai\UseCases\GenerateDailyDigest;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('ai:daily-digest {--user-id=*} {--date=} {--force}', function (
    GenerateDailyDigest $useCase,
): int {
    $timezone = (string) config('app.timezone', 'UTC');

    $date = $this->option('date')
        ? CarbonImmutable::parse((string) $this->option('date'), $timezone)->startOfDay()
        : CarbonImmutable::now($timezone)->startOfDay();

    /** @var array<int, mixed> $userIds */
    $userIds = $this->option('user-id');
    $force = (bool) $this->option('force');

    $query = User::query()->select('id')->orderBy('id');

    if ($userIds !== []) {
        $normalizedIds = array_values(array_filter(array_map(static fn (mixed $value): int => (int) $value, $userIds)));
        $query->whereIn('id', $normalizedIds);
    }

    $success = 0;
    $failed = 0;

    foreach ($query->cursor() as $user) {
        try {
            $result = $useCase->handle(GenerateDailyDigestData::forDate(
                userId: (int) $user->id,
                date: $date,
                forceRefresh: $force,
            ));

            $artifact = $result['artifact'] ?? null;
            $this->line(sprintf(
                'User #%d: digest %s',
                (int) $user->id,
                $artifact?->title ?? 'generated',
            ));
            $success++;
        } catch (Throwable $e) {
            $this->error(sprintf('User #%d failed: %s', (int) $user->id, $e->getMessage()));
            $failed++;
        }
    }

    $this->info(sprintf(
        'Daily digest generation finished. Success: %d. Failed: %d. Date: %s',
        $success,
        $failed,
        $date->toDateString(),
    ));

    return $failed > 0 ? 1 : 0;
})->purpose('Generate AI daily digests for users');
