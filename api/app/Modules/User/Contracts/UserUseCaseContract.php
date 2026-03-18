<?php

declare(strict_types=1);

namespace App\Modules\User\Contracts;

interface UserUseCaseContract
{
    /**
     * @param object $data
     * @return mixed
     */
    public function handle(object $data): mixed;
}
