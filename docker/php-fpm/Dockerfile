FROM php:7.2-fpm-alpine3.11

LABEL maintainer="WhereGroup <info@wheregroup.com>"
LABEL version="1.0"

ARG var_uid
ARG var_gid
ARG var_key
ARG var_remove_host

ENV CURRENT_UID=$var_uid
ENV CURRENT_GID=$var_gid
ENV REMOVE_HOST=$var_remove_host
ENV WAIT_VERSION 2.7.2

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/${WAIT_VERSION}/wait /bin/wait

COPY entrypoint.sh /entrypoint.sh
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN apk --update --no-cache add autoconf build-base shadow git openssh-client unzip php7-pear php7-dev \
    freetype-dev libjpeg-turbo-dev libpng-dev icu-libs icu-dev \
    libgit2-dev libxml2-dev oniguruma-dev libzip-dev bzip2-dev \
    sqlite-dev openldap-dev postgresql-dev openssl nodejs npm python yarn \
    && docker-php-ext-install curl gd intl mbstring zip bz2 xml pdo pdo_sqlite pdo_pgsql \
    && pecl install xdebug && docker-php-ext-enable xdebug \
    && echo "xdebug.idekey=PHPSTORM" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.remote_enable=on" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.remote_handler=dbgp" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.remote_host=${REMOVE_HOST}" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.remote_port=9001" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && rm -rf /var/cache/apk/* /tmp/pear/ /var/lib/apt/lists/* \
    && chmod +x /bin/wait /usr/bin/composer \
    && chmod 755 /entrypoint.sh \
    && usermod -u ${CURRENT_UID}  www-data && groupmod -g ${CURRENT_GID} www-data \
    && chown www-data:www-data -R /home/www-data \
    && chown www-data:www-data -R /etc/php7/conf.d

WORKDIR /var/www

USER www-data

EXPOSE 9000

ENTRYPOINT ["/entrypoint.sh"]

CMD ["php-fpm"]
