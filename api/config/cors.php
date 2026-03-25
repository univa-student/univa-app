<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'user', 'broadcasting/auth'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://korbin-perigynous-metaphrastically.ngrok-free.dev',
    ],

    'allowed_origins_patterns' => [

        '#^https://[\w-]+\.ngrok-free\.dev$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
