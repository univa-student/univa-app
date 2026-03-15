<?php

declare(strict_types=1);

namespace App\Modules\Ai\Contracts;

/**
 * @template TResponse
 * @template TContext of object
 * @template TArtifact of object
 */
interface ArtifactFormatterContract
{
    /**
     * @param TResponse $response
     * @param TContext $context
     * @param object|null $input
     * @return TArtifact
     */
    public function format(mixed $response, object $context, ?object $input = null): object;
}
