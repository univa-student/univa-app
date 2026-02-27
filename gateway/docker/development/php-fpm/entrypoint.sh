#!/bin/sh
# docker/development/php-fpm/entrypoint.sh
# Запускается при старте php-fpm контейнера (от root).
# Использует su-exec для выполнения php-fpm от www-data.

set -e

# Фиксируем права на рабочую директорию (на случай bind-mount)
chown -R www-data:www-data /var/www/app 2>/dev/null || true

# Если переданы аргументы — выполняем их (docker exec artisan ...)
if [ "$#" -gt 0 ]; then
    exec su-exec www-data "$@"
fi

# По умолчанию — запуск php-fpm
exec php-fpm
