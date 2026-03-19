docker-up:
    docker compose up -d

docker-down:
    docker compose down

docker-build:
    docker compose build --no-cache

api-migrate:
    docker exec gateway_php_fpm php artisan migrate

api-seed:
    docker exec gateway_php_fpm php artisan db:seed

frontend-build:
    cd frontend && npm run build

frontend-dev:
    cd frontend && npm run dev

api-dev:
    cd api && php artisan serve

api-broadcast:
    cd api && php artisan reverb:start

start:
    just frontend-dev &
    just api-dev &
    just api-broadcast &
    wait