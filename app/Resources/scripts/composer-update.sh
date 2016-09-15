#!/bin/bash
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
ROOTPATH=$SCRIPTPATH/../../../.

cd $ROOTPATH

if [ ! -f "$ROOTPATH/composer.phar" ]; then
    echo "+ Downloading composer.phar to $ROOTPATH"
    curl -sS https://getcomposer.org/installer | php
else
    echo "+ Updating composer.phar if needed"
    ./composer.phar self-update
fi

echo "+ Composer update."
./composer.phar install
