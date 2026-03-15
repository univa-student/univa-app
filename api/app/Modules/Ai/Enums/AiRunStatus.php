<?php

declare(strict_types=1);

namespace App\Modules\Ai\Enums;

enum AiRunStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
    case CANCELED = 'canceled';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function isFinished(): bool
    {
        return in_array($this, [
            self::COMPLETED,
            self::FAILED,
            self::CANCELED,
        ], true);
    }

    public function isSuccessful(): bool
    {
        return $this === self::COMPLETED;
    }

    public function canBeUpdated(): bool
    {
        return !$this->isFinished();
    }

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::PROCESSING => 'Processing',
            self::COMPLETED => 'Completed',
            self::FAILED => 'Failed',
            self::CANCELED => 'Canceled',
        };
    }
}
