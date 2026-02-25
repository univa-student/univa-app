FROM php:8.3-cli-alpine

RUN mv $PHP_INI_DIR/php.ini-development $PHP_INI_DIR/php.ini

COPY ./gateway/docker/development/php/conf.d /usr/local/etc/php/conf.d

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/bin --filename=composer --quiet

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

RUN apk add --no-cache pcre-dev $PHPIZE_DEPS \
        && pecl install redis \
        && docker-php-ext-enable redis.so

COPY ./gateway/docker/development/php-cli/scripts /app/scripts

RUN chmod +x /app/scripts/crontab.sh && sed -i 's/\r$//' /app/scripts/crontab.sh

COPY ./gateway/docker/development/php-cli/config/crontabs /var/spool/cron/crontabs

CMD ["/app/scripts/crontab.sh"]


WORKDIR /app/api
