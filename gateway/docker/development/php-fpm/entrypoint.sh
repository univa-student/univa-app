#!/bin/sh
# gateway/docker/development/php-fpm/entrypoint.sh
# Запускается перед php-fpm при каждом старте контейнера.
# set -e: выход при любой ошибке (кроме команд с || true)
set -e

APP_DIR="/var/www/app"

echo "🚀 PHP-FPM entrypoint starting..."

# ── 1. Проверяем что APP_DIR примонтирован и содержит Laravel ────────────────
if [ ! -f "${APP_DIR}/artisan" ]; then
    echo "❌ ${APP_DIR}/artisan not found!"
    echo "   Проверь APP_PATH в gateway/.env — он должен указывать на папку api/"
    echo "   Текущее содержимое ${APP_DIR}:"
    ls -la "${APP_DIR}" 2>/dev/null || echo "   (пустая папка)"
    exit 1
fi

# ── 2. .env check ────────────────────────────────────────────────────────────
if [ ! -f "${APP_DIR}/.env" ]; then
    echo "⚠️  No .env found, copying from .env.example..."
    if [ -f "${APP_DIR}/.env.example" ]; then
        cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
        echo "✅ .env created from .env.example"
    else
        echo "❌ Neither .env nor .env.example found in ${APP_DIR}!"
        exit 1
    fi
fi

# ── 3. Composer install ──────────────────────────────────────────────────────
if [ ! -f "${APP_DIR}/vendor/autoload.php" ]; then
    echo "📦 Running composer install..."
    composer install \
        --working-dir="${APP_DIR}" \
        --no-interaction \
        --no-progress \
        --prefer-dist \
        --optimize-autoloader
    echo "✅ Composer install done"
else
    echo "✅ vendor/ exists, skipping composer install"
fi

# ── 4. APP_KEY generate ──────────────────────────────────────────────────────
APP_KEY=$(grep "^APP_KEY=" "${APP_DIR}/.env" | cut -d'=' -f2)
if [ -z "${APP_KEY}" ]; then
    echo "🔑 Generating APP_KEY..."
    php "${APP_DIR}/artisan" key:generate --force
    echo "✅ APP_KEY generated"
else
    echo "✅ APP_KEY already set"
fi

# ── 5. Storage permissions ────────────────────────────────────────────────────
# На Windows + Docker Desktop chmod может не работать для bind-mount томов,
# поэтому используем || true чтобы не падать при ошибке прав
echo "📁 Setting storage permissions..."
mkdir -p \
    "${APP_DIR}/storage/app/public" \
    "${APP_DIR}/storage/framework/cache/data" \
    "${APP_DIR}/storage/framework/sessions" \
    "${APP_DIR}/storage/framework/testing" \
    "${APP_DIR}/storage/framework/views" \
    "${APP_DIR}/storage/logs" \
    "${APP_DIR}/bootstrap/cache" || true
chmod -R 775 "${APP_DIR}/storage" "${APP_DIR}/bootstrap/cache" 2>/dev/null || true
echo "✅ Permissions done (errors ignored on Windows volumes)"

# ── 6. Cache clear (dev) ──────────────────────────────────────────────────────
php "${APP_DIR}/artisan" config:clear  --quiet || true
php "${APP_DIR}/artisan" route:clear   --quiet || true
php "${APP_DIR}/artisan" view:clear    --quiet || true

# ── 7. Migrate (автоматически в dev) ─────────────────────────────────────────
echo "🗄️  Running migrations..."
php "${APP_DIR}/artisan" migrate --force --no-interaction
echo "✅ Migrations done"

echo "🎉 Setup complete! Starting php-fpm..."
# PHP-FPM мастер-процесс работает от root (читает /proc/self/fd/2, конфиги).
# Воркеры сами дропают привилегии до www-data через www.conf (user = www-data).
# su-exec здесь ломает доступ к stderr → Permission denied на /proc/self/fd/2.
exec php-fpm
