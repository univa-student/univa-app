<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Prometheus\CollectorRegistry;
use Symfony\Component\HttpFoundation\Response;

class RecordMetrics
{
    public function __construct(
        private readonly CollectorRegistry $registry,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);

        /** @var Response $response */
        $response = $next($request);

        $duration = microtime(true) - $startTime;

        $route  = $request->route()?->uri() ?? 'unknown';
        $method = $request->method();
        $status = (string) $response->getStatusCode();

        // ── Счётчик HTTP-запросов ─────────────────────────────────────────────
        $counter = $this->registry->getOrRegisterCounter(
            namespace: 'laravel',
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labels: ['method', 'route', 'status'],
        );
        $counter->inc([$method, $route, $status]);

        // ── Гистограмма времени ответа ────────────────────────────────────────
        $histogram = $this->registry->getOrRegisterHistogram(
            namespace: 'laravel',
            name: 'http_request_duration_seconds',
            help: 'HTTP request duration in seconds',
            labels: ['method', 'route', 'status'],
            buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
        );
        $histogram->observe($duration, [$method, $route, $status]);

        return $response;
    }
}
