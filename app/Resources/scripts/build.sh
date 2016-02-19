#!/bin/bash

PROJECTNAME=metador
PACKAGES_FOLDER=/packages/build/metador2

BUILD=[zip msi]

# -------------------------------

TEMPPATH=/tmp
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
ROOTPATH=$SCRIPTPATH/../../../.

if [ -z "$CI_BUILD_REF_NAME" ]; then
    CI_BUILD_REF_NAME=dev
fi

if [ -z "$CI_BUILD_ID" ]; then
    CI_BUILD_ID=$(date +%s)
fi

echo "Building package for $PROJECTNAME version $CI_BUILD_REF_NAME build $CI_BUILD_ID";

cd $TEMPPATH

# Remove temp folder if exists
if [ -d "$TEMPPATH/$PROJECTNAME" ]; then
    echo "Removing $TEMPPATH/$PROJECTNAME"
    rm -rf "$TEMPPATH/$PROJECTNAME"
fi

# Create temp folder
echo "Creating $TEMPPATH/$PROJECTNAME folder"
mkdir $TEMPPATH/$PROJECTNAME

# Copy project to temp folder
echo "Copy project to $TEMPPATH/$PROJECTNAME"
cp -R $ROOTPATH/* $TEMPPATH/$PROJECTNAME


cd $TEMPPATH/$PROJECTNAME

# Remove all .git folders
echo "Cleanup the project"
rm -rf `find . -type d -name .git`

# Zip the project
cd $TEMPPATH

if [ -f "$TEMPPATH/$PROJECTNAME.zip" ]; then
    echo "Removing old zip file"
    rm "$TEMPPATH/$PROJECTNAME.zip"
fi

echo "Zip project"
zip -q -r $PROJECTNAME.zip $PROJECTNAME

echo "Move project to $PACKAGES_FOLDER"
mv $PROJECTNAME.zip $PACKAGES_FOLDER/$PROJECTNAME-$CI_BUILD_REF_NAME-$CI_BUILD_ID.zip

# Cleanup
echo "Cleanup"
rm -rf "$TEMPPATH/$PROJECTNAME"

exit 0
