<?php

namespace App\Modules\Profiles\Integrations;

use Saloon\Http\Connector;
use Saloon\Traits\Plugins\AcceptsJson;

class EdboConnector extends Connector
{
    use AcceptsJson;

    public function resolveBaseUrl(): string
    {
        return config('integrations.edbo.url');
    }

    protected function defaultHeaders(): array
    {
        return [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
    }

    protected function defaultConfig(): array
    {
        return [];
    }
}
