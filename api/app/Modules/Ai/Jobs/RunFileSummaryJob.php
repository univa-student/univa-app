<?php

declare(strict_types=1);

namespace App\Modules\Ai\Jobs;

use App\Modules\Ai\DTO\SummarizeFileData;
use App\Modules\Ai\UseCases\SummarizeFile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class RunFileSummaryJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 180;

    /**
     * @param array<string, mixed> $payload
     */
    public function __construct(
        private readonly array $payload,
    ) {
        $this->onQueue('ai');
    }

    public static function fromDto(SummarizeFileData $data): self
    {
        return new self($data->toArray());
    }

    public function handle(SummarizeFile $useCase): void
    {
        $useCase->handle(
            SummarizeFileData::fromArray($this->payload),
        );
    }

    public function failed(?Throwable $exception): void
    {
        if ($exception !== null) {
            report($exception);
        }
    }
}
