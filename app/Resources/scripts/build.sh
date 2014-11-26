#!/bin/bash
TEMPPATH=/tmp
PROJECTNAME=metador2

cd $TEMPPATH

if [ -d "$TEMPPATH/$PROJECTNAME" ]; then
    echo "$TEMPPATH/$PROJECTNAME wird gelöscht."
    rm -rf "$TEMPPATH/$PROJECTNAME"
fi

git clone https://github.com/WhereGroup/$PROJECTNAME.git

cd $TEMPPATH/$PROJECTNAME

cp app/config/parameters.yml.dist app/config/parameters.yml
app/Resources/scripts/composer-update.sh

rm -rf `find . -type d -name .git`

cd $TEMPPATH

if [ -f "$TEMPPATH/$PROJECTNAME.zip" ]; then
    rm "$TEMPPATH/$PROJECTNAME.zip"
fi

zip -r $PROJECTNAME.zip $PROJECTNAME

rm -rf "$TEMPPATH/$PROJECTNAME"
