docker-up:
    docker compose up -d

docker-down:
    docker compose down

docker-build:
    docker compose build -no-cache

api-migrate:
    docker exec gateway_php_fpm php artisan migrate

api-seed:
    docker exec gateway_php_fpm php artisan db:seed

frontend-build:
    npm run build