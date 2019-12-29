#!/bin/bash

# delete file if exists first
LAMBDA_ZIP_FILE=lambda.zip

if test -f "$LAMBDA_ZIP_FILE"; then
    rm $LAMBDA_ZIP_FILE
    echo "DELETED $LAMBDA_ZIP_FILE"
fi
