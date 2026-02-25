#!/bin/sh
# docker/development/php-cli/scripts/entrypoint.sh
# Запускается при старте php-cli контейнера.
# Ждёт готовности БД перед выполнением команд.

set -e

# Ждём postgres (простая проверка через PHP PDO)
wait_for_postgres() {
    echo "⏳ Waiting for PostgreSQL..."
    until php -r "
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
    echo "✅ PostgreSQL is ready"
}

# Если передана команда — выполняем её, иначе запускаем shell
if [ "$1" = "wait-db" ]; then
    wait_for_postgres
    shift
    exec "$@"
else
    exec "$@"
fi