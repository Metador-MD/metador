#!/bin/bash
SCRIPTPATH=$(pwd)
ROOTPATH=$SCRIPTPATH/../../.

cd $ROOTPATH

if [ ! -f "$ROOTPATH/composer.phar" ]; then
    curl -sS https://getcomposer.org/installer | php
fi

./composer.phar self-update
./composer.phar update