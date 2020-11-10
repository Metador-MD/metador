#!/bin/sh

CONTAINER_ALREADY_STARTED="CONTAINER_INSTALLED"
XDEBUG_INI_FILE="/etc/php7/conf.d/xdebug.ini"

cd /var/www || exit;

# INSTALL
# shellcheck disable=SC2039
if [[ ! -f ${CONTAINER_ALREADY_STARTED} ]]; then
  echo "parameters:
    database_driver: pdo_pgsql
    database_host: postgis
    database_port: null
    database_name: metador
    database_user: ${PGSQL_USER}
    database_password: ${PGSQL_PASSWORD}
    database_path: null
    mailer_transport: smtp
    mailer_host: 127.0.0.1
    mailer_user: null
    mailer_password: null
    secret: ${APP_SECRET}
    locale: de
    api_access_ips: {  }
    csw_access_ips: {  }
    cache_enabled: false" > /var/www/app/config/parameters.yml \
  && rm -rf var/cache/* \
  && rm -rf var/logs/* \
  && php -d memory_limit=-1 /usr/bin/composer update -o \
  && bin/console doctrine:database:create \
  && bin/console doctrine:schema:create \
  && bin/console metador:init:db \
  && bin/console assets:install --symlink
  touch ${CONTAINER_ALREADY_STARTED}
# UPDATE
else
    rm -rf var/cache/*
    rm -rf var/logs/*
    bin/console doctrine:schema:update --force
    bin/console assets:install --symlink
fi

# SET IP ADDRESS OF XDEBUG_REMOTE_HOST
OLD_IP_ADDRESS="^xdebug.remote_host=.*$"
NEW_IP_ADDRESS="xdebug.remote_host=${XDEBUG_REMOTE_HOST}"

sed -i "s/${OLD_IP_ADDRESS}/${NEW_IP_ADDRESS}/g" "${XDEBUG_INI_FILE}"

exec docker-php-entrypoint "$@"
