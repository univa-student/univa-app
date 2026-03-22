#!/bin/sh
# gateway/docker/development/php-fpm/entrypoint.sh
set -e

APP_DIR="/var/www/app"

echo "🚀 PHP-FPM entrypoint starting..."

# ── 1. Кастомная команда (docker exec ... artisan и т.п.) ─────────────────────
if [ "$#" -gt 0 ]; then
    echo "⚙️  Executing custom command: $*"
    exec su-exec www-data "$@"
fi

# ── 2. Проверка монтирования тома ─────────────────────────────────────────────
if [ ! -f "${APP_DIR}/artisan" ]; then
    echo "❌ ${APP_DIR}/artisan not found — check volume mounts."
    exit 1
fi

# ── 3. .env файл ──────────────────────────────────────────────────────────────
if [ ! -f "${APP_DIR}/.env" ]; then
    if [ -f "${APP_DIR}/.env.example" ]; then
        echo "⚠️  No .env found — copying from .env.example..."
        cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
        chown www-data:www-data "${APP_DIR}/.env"
    else
        echo "❌ Neither .env nor .env.example found!"
        exit 1
    fi
fi

# ── 4. Права на storage и bootstrap/cache ─────────────────────────────────────
echo "📁 Preparing storage directories..."
mkdir -p \
    "${APP_DIR}/storage/framework/sessions" \
    "${APP_DIR}/storage/framework/views" \
    "${APP_DIR}/storage/framework/cache/data" \
    "${APP_DIR}/storage/logs" \
    "${APP_DIR}/bootstrap/cache"

chown -R www-data:www-data \
    "${APP_DIR}/storage" \
    "${APP_DIR}/bootstrap/cache" 2>/dev/null || true

chmod -R 775 \
    "${APP_DIR}/storage" \
    "${APP_DIR}/bootstrap/cache" 2>/dev/null || true

# ── 5. Artisan-команды — только если vendor уже установлен ───────────────────
# vendor/ отсутствует при первом запуске свежего проекта.
# Установите зависимости вручную:
#   docker compose --profile tools run --rm php-cli composer install
if [ -f "${APP_DIR}/vendor/autoload.php" ]; then

    # APP_KEY
    APP_KEY=$(grep "^APP_KEY=" "${APP_DIR}/.env" | cut -d'=' -f2)
    if [ -z "${APP_KEY}" ] || [ "${APP_KEY}" = "null" ] || [ "${APP_KEY}" = "base64:" ]; then
        echo "🔑 Generating APP_KEY..."
        su-exec www-data php "${APP_DIR}/artisan" key:generate --force
    else
        echo "✅ APP_KEY already set."
    fi

    # Миграции
    echo "🗄️  Running migrations..."
    su-exec www-data php "${APP_DIR}/artisan" migrate --force --no-interaction

else
    echo "⚠️  vendor/autoload.php not found — skipping artisan setup."
    echo "    First-time setup:"
    echo "    docker compose --profile tools run --rm php-cli composer install"
fi

# ── 6. Запуск PHP-FPM ─────────────────────────────────────────────────────────
echo "🎉 Starting php-fpm..."
exec php-fpm