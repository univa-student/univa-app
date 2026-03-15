<?php

declare(strict_types=1);

namespace App\Modules\Ai\Exceptions;

use Exception;
use Throwable;

class AiException extends Exception
{
    public function __construct(
        string $message = 'AI module error',
        protected array $context = [],
        int $code = 0,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, $code, $previous);
    }

    public function context(): array
    {
        return $this->context;
    }

    public static function fromMessage(string $message, array $context = []): static
    {
        return new static($message, $context);
    }
}
