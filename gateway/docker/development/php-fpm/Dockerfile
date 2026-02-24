FROM php:8.3-fpm-alpine

RUN apk update && apk add autoconf g++ make libzip-dev zip unzip \
    && docker-php-ext-configure zip \
    && docker-php-ext-install zip

RUN apk add --no-cache \
    oniguruma-dev libxml2-dev libpng-dev libjpeg-turbo-dev freetype-dev \
    && docker-php-ext-install mbstring dom \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd

RUN apk add --no-cache ttf-dejavu ttf-liberation

RUN apk add --no-cache postgresql-dev \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo_pgsql

RUN mv $PHP_INI_DIR/php.ini-development $PHP_INI_DIR/php.ini

COPY ./gateway/docker/development/php/conf.d /usr/local/etc/php/conf.d


RUN apk add --no-cache pcre-dev $PHPIZE_DEPS \
&& pecl install redis \
&& docker-php-ext-enable redis.so

WORKDIR /app
