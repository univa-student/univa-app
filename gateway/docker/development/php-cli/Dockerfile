# docker/development/php-cli/Dockerfile
# Наследуем от php-cli Alpine — тот же язык, что в php-fpm, но без FPM-демона.
# В реальных проектах выносят общую часть в отдельный base-образ.
ARG PHP_VERSION=8.2
FROM php:${PHP_VERSION}-cli-alpine AS base

ARG UID=1000
ARG GID=1000

# Системные зависимости (те же что в fpm + git для composer)
RUN apk add --no-cache \
    git \
    unzip \
    curl \
    bash \
    linux-headers \
    libpq-dev \
    libzip-dev \
    icu-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    oniguruma-dev \
    && apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    && docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_pgsql \
    pgsql \
    zip \
    intl \
    gd \
    bcmath \
    mbstring \
    pcntl \
    sockets \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps \
    && rm -rf /tmp/pear

# ── Composer ──────────────────────────────────────────────────────────────────
# Официальный способ: копируем бинарь из образа composer
# Не устанавливаем глобально через apk — версия может быть устаревшей
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ── Пользователь (та же логика, что в php-fpm) ────────────────────────────────
RUN delgroup www-data 2>/dev/null || true \
    && deluser www-data 2>/dev/null || true \
    && addgroup -g ${GID} -S www-data \
    && adduser -u ${UID} -S -G www-data -H www-data \
    && mkdir -p /var/www/app /var/www/.composer \
    && chown -R www-data:www-data /var/www

# ── Вспомогательные скрипты (entrypoint, wait-for-db, etc.) ───────────────────
COPY scripts/ /usr/local/bin/
RUN chmod +x /usr/local/bin/*.sh 2>/dev/null || true

WORKDIR /var/www/app
USER www-data

# ── ENTRYPOINT + CMD ───────────────────────────────────────────────────────────
# ИСПРАВЛЕНО: без CMD контейнер с restart:"no" сразу выходил с кодом 0.
# entrypoint.sh поддерживает "wait-db" для ожидания БД перед миграциями.
# CMD tail -f /dev/null держит контейнер живым для docker exec artisan ...
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["tail", "-f", "/dev/null"]