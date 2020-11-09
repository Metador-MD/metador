#!/bin/sh

CONTAINER_ALREADY_STARTED="CONTAINER_INSTALLED"
XDEBUG_INI_FILE="/etc/php7/conf.d/xdebug.ini"

cd /var/www || exit;

# INSTALL
# shellcheck disable=SC2039
if [[ ! -f ${CONTAINER_ALREADY_STARTED} ]]; then
  rm -rf var/cache/* \
  && rm -rf var/logs/* \
  && php -d memory_limit=-1 /usr/bin/composer update -o \
  && bin/console docktrine:database:create \
  && bin/console docktrine:schema:create \
  && bin/console assets:install --symlink
  touch ${CONTAINER_ALREADY_STARTED}
# UPDATE
else
    rm -rf var/cache/*
    rm -rf var/logs/*
    bin/console docktrine:schema:update --force
    bin/console assets:install --symlink
fi

# SET IP ADDRESS OF XDEBUG_REMOTE_HOST
OLD_IP_ADDRESS="^xdebug.remote_host=.*$"
NEW_IP_ADDRESS="xdebug.remote_host=${XDEBUG_REMOTE_HOST}"

sed -i "s/${OLD_IP_ADDRESS}/${NEW_IP_ADDRESS}/g" "${XDEBUG_INI_FILE}"

exec docker-php-entrypoint "$@"
