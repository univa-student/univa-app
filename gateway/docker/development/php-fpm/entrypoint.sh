#!/bin/sh
# gateway/docker/development/php-fpm/entrypoint.sh

# set -e: выход при любой ошибке
set -e

APP_DIR="/var/www/app"

echo "🚀 PHP-FPM entrypoint starting..."

# 1. Если переданы аргументы (например, docker exec ... artisan), выполняем их от www-data
if [ "$#" -gt 0 ]; then
    echo "⚙️ Executing custom command: $@"
    exec su-exec www-data "$@"
fi

# 2. Проверяем наличие artisan
if [ ! -f "${APP_DIR}/artisan" ]; then
    echo "❌ ${APP_DIR}/artisan not found! Check your volume mounts."
    exit 1
fi

# 3. Обработка .env (необходима для работы artisan и тестов в CI)
if [ ! -f "${APP_DIR}/.env" ]; then
    if [ -f "${APP_DIR}/.env.example" ]; then
        echo "⚠️ No .env found, copying from .env.example..."
        cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
        # Убеждаемся, что у www-data будет доступ к новому файлу
        chown www-data:www-data "${APP_DIR}/.env"
    else
        echo "❌ Neither .env nor .env.example found!"
        exit 1
    fi
fi

# 4. Проверка и генерация APP_KEY (решает проблему MissingAppKeyException)
APP_KEY=$(grep "^APP_KEY=" "${APP_DIR}/.env" | cut -d'=' -f2)
if [ -z "${APP_KEY}" ] || [ "${APP_KEY}" = "null" ]; then
    echo "🔑 Generating APP_KEY..."
    php "${APP_DIR}/artisan" key:generate --force
else
    echo "✅ APP_KEY is already set."
fi

# 5. Composer install (только если нет папки vendor)
if [ ! -d "${APP_DIR}/vendor" ]; then
    echo "📦 Running composer install..."
    composer install --working-dir="${APP_DIR}" --no-interaction --no-progress --prefer-dist --optimize-autoloader
fi

# 6. Права доступа (chown для bind-mounts и создание нужных директорий)
echo "📁 Preparing storage and permissions..."
mkdir -p "${APP_DIR}/storage/framework/sessions" \
         "${APP_DIR}/storage/framework/views" \
         "${APP_DIR}/storage/framework/cache/data" \
         "${APP_DIR}/storage/logs" \
         "${APP_DIR}/bootstrap/cache"

# Исправляем владельца для работы внутри контейнера
chown -R www-data:www-data "${APP_DIR}/storage" "${APP_DIR}/bootstrap/cache" 2>/dev/null || true
chmod -R 775 "${APP_DIR}/storage" "${APP_DIR}/bootstrap/cache" 2>/dev/null || true

# 7. База данных: Ожидание и миграции
echo "🗄️ Running migrations..."

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    php "${APP_DIR}/artisan" migrate --force --no-interaction
fi

# 8. Финальный запуск php-fpm
echo "🎉 Setup complete! Starting php-fpm..."
# Запускаем мастер-процесс от root, он сам сбросит права воркеров до www-data согласно www.conf
exec php-fpm
