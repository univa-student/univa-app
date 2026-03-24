<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Contracts;

/**
 * @template TInput of object
 * @template TResult
 */
interface SaveUniversityUseCaseContract
{
    /**
     * @param TInput $data
     * @return TResult
     */
    public function handle(object $data): mixed;
}
