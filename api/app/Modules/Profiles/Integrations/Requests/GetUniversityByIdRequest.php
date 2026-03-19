<?php

namespace App\Modules\Profiles\Integrations\Requests;

use Saloon\Enums\Method;
use Saloon\Http\Request;

class GetUniversityByIdRequest extends Request
{
    protected Method $method = Method::GET;

    public function __construct(
        protected string $id,
    ) {}

    public function resolveEndpoint(): string
    {
        return '/university/';
    }

    protected function defaultQuery(): array
    {
        return [
            'id' => $this->id,
            'exp' => 'json',
        ];
    }
}
