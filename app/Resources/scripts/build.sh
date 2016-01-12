#!/bin/bash
TEMPPATH=/tmp
PROJECTNAME=metador2
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
ROOTPATH=$SCRIPTPATH/../../../.

cd $TEMPPATH

if [ -d "$TEMPPATH/$PROJECTNAME" ]; then
    echo "$TEMPPATH/$PROJECTNAME wird gelöscht."
    rm -rf "$TEMPPATH/$PROJECTNAME"
fi

mkdir $TEMPPATH/$PROJECTNAME

# git clone https://github.com/WhereGroup/$PROJECTNAME.git -b 2.1

cp -R $ROOTPATH/* $TEMPPATH/$PROJECTNAME

cd $TEMPPATH/$PROJECTNAME

# cp app/config/parameters.yml.dist app/config/parameters.yml
# app/Resources/scripts/composer-update.sh

rm -rf `find . -type d -name .git`

cd $TEMPPATH

if [ -f "$TEMPPATH/$PROJECTNAME.zip" ]; then
    rm "$TEMPPATH/$PROJECTNAME.zip"
fi

zip -q -r $PROJECTNAME.zip $PROJECTNAME

rm -rf "$TEMPPATH/$PROJECTNAME"
