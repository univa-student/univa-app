<?php

declare(strict_types=1);

namespace App\Modules\Ai\Contracts;

/**
 * @template TInput of object
 * @template TResult
 */
interface AiUseCaseContract
{
    /**
     * @param TInput $data
     * @return TResult
     */
    public function handle(object $data): mixed;
}
