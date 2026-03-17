<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'user'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://korbin-perigynous-metaphrastically.ngrok-free.dev',
    ],
    'supports_credentials' => true,
//    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost'), 'http://localhost:5173'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,
];

