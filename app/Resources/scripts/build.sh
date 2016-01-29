#!/bin/bash

PROJECTNAME=metador
PACKAGES_FOLDER=/packages/metador2

TEMPPATH=/tmp
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
ROOTPATH=$SCRIPTPATH/../../../.

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "No argument supplied"
    exit 1
fi

cd $TEMPPATH

# Remove temp folder if exists
if [ -d "$TEMPPATH/$PROJECTNAME" ]; then
    echo "Removing $TEMPPATH/$PROJECTNAME"
    rm -rf "$TEMPPATH/$PROJECTNAME"
fi

# Create temp folder
mkdir $TEMPPATH/$PROJECTNAME

# Copy project to temp folder
cp -R $ROOTPATH/* $TEMPPATH/$PROJECTNAME


cd $TEMPPATH/$PROJECTNAME

# Remove all .git folders
rm -rf `find . -type d -name .git`


# Zip the project
cd $TEMPPATH

if [ -f "$TEMPPATH/$PROJECTNAME.zip" ]; then
    rm "$TEMPPATH/$PROJECTNAME.zip"
fi

zip -q -r $PROJECTNAME.zip $PROJECTNAME

mv $PROJECTNAME.zip $PACKAGES/$PROJECTNAME-$1-$2.zip

# Cleanup
rm -rf "$TEMPPATH/$PROJECTNAME"

exit
