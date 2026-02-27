#!/bin/sh
# docker/development/php-cli/scripts/entrypoint.sh
# Запускается при старте php-cli контейнера (от root).
# Использует su-exec для выполнения команд от www-data.

set -e

APP_DIR="/var/www/app"

# Ждём postgres через PHP PDO
wait_for_postgres() {
    echo "Waiting for PostgreSQL at ${DB_HOST:-postgres}..."
    until su-exec www-data php -r "
        try {
            new PDO('pgsql:host=${DB_HOST:-postgres};port=5432;dbname=${DB_DATABASE:-app}',
                    '${DB_USERNAME:-app}', '${DB_PASSWORD:-secret}');
            echo 'ok';
        } catch (Exception \$e) {
            exit(1);
        }
    " 2>/dev/null; do
        sleep 2
    done
    echo "PostgreSQL is ready"
}

# Если первый аргумент — "wait-db", ждём БД затем выполняем остальное
if [ "$1" = "wait-db" ]; then
    wait_for_postgres
    shift
    exec su-exec www-data "$@"
else
    # Выполняем команду от www-data
    exec su-exec www-data "$@"
fi