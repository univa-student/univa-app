<?php

declare(strict_types=1);

namespace App\Modules\Ai\Contracts;

/**
 * @template TInput of object
 * @template TContext of object
 */
interface ContextBuilderContract
{
    /**
     * @param TInput $data
     * @return TContext
     */
    public function build(object $data): object;
}
