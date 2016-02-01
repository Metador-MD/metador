#!/bin/bash

PROJECTNAME=metador2

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
ROOTPATH=$SCRIPTPATH/../../../.
PACKAGES_FOLDER=/packages

# Run unit tests
if [ -d "$PACKAGES_FOLDER/report/$PROJECTNAME/coverage" ]; then
    echo "Test - phpunit + coverage"
    $ROOTPATH/bin/phpunit -c $ROOTPATH/app --coverage-html $PACKAGES_FOLDER/report/$PROJECTNAME/coverage
else
    echo "Test - phpunit"
    $ROOTPATH/bin/phpunit -c $ROOTPATH/app
fi

# Check code for PSR2 convention
echo "Test - phpcs"
$ROOTPATH/bin/phpcs -n --extensions=php --standard=PSR2 $ROOTPATH/src/

# Run the copy paste detector
echo "Test - phpcpd"
$ROOTPATH/bin/phpcpd $ROOTPATH/src/

# Test complexity
echo "Test - pdepend"
bin/pdepend \
    --summary-xml=$PACKAGES_FOLDER/report/$PROJECTNAME/summary.xml \
    --jdepend-chart=$PACKAGES_FOLDER/report/$PROJECTNAME/jdepend.svg \
    --overview-pyramid=$PACKAGES_FOLDER/report/$PROJECTNAME/pyramid.svg \
    src/

# PHP mess detector
echo "Test - phpmd"
# xml, text, html
# cleancode, codesize, controversial, design, naming, unusedcode
bin/phpmd \
    src/ \
    html \
    cleancode \
    --reportfile $PACKAGES_FOLDER/report/$PROJECTNAME/index.html
