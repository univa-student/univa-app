<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Prometheus\CollectorRegistry;
use Prometheus\Storage\Redis as RedisAdapter;

class PrometheusServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(CollectorRegistry::class, function () {
            $adapter = new RedisAdapter([
                'host'              => config('database.redis.default.host', '127.0.0.1'),
                'port'              => (int) config('database.redis.default.port', 6379),
                'password'          => config('database.redis.default.password'),
                'timeout'           => 0.1,
                'read_timeout'      => 10,
                'persistent_connections' => false,
                'prefix'            => 'prometheus_',
            ]);

            return new CollectorRegistry($adapter);
        });
    }
}
