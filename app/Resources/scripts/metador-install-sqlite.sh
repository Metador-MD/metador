#!/bin/bash
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
ROOTPATH=$SCRIPTPATH/../../../.

cd $ROOTPATH

if [ ! -f "$ROOTPATH/app/config/parameters.yml" ]; then
    echo "Create and edit configuration."
    cp app/config/parameters.yml.dist app/config/parameters.yml
fi

app/Resources/scripts/composer-update.sh

echo "Create database"
app/console doctrine:database:create
app/console doctrine:schema:create
app/console assets:install web

chmod o+rw app/cache
chmod o+rw app/logs

echo "Create Superuser"
app/console metador:reset:superuser 