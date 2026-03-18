<?php

namespace App\Modules\Profiles\Integrations\Requests;

use Saloon\Enums\Method;
use Saloon\Http\Request;

class GetUniversityByRegionRequest extends Request
{
    protected Method $method = Method::GET;

    public function __construct(
        protected string $regionCode,
    ) {}

    public function resolveEndpoint(): string
    {
        return '/universities/';
    }

    protected function defaultQuery(): array
    {
        return [
            'lc' => $this->regionCode,
            'exp' => 'json',
        ];
    }
}
