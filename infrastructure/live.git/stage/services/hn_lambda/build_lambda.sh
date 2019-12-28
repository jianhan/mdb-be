#!/bin/bash

LAMBDA_ZIP_FILE=lambda.zip
PROJECT_ROOT_DIR=mdb-be
TERRAFORM_DIR=$(pwd)

function cdroot()
{
  while [[ $PWD != '/' && ${PWD##*/} != "$PROJECT_ROOT_DIR" ]]; do cd ..; done
}

cdroot

PROJECT_ROOT_DIR=$(pwd)
LAMBDA_DIR="$PROJECT_ROOT_DIR/hn"

# delete file if exists first
if test -f "$TERRAFORM_DIR/$LAMBDA_ZIP_FILE"; then
    rm $LAMBDA_ZIP_FILE
    echo "DELETED $LAMBDA_ZIP_FILE"
fi

# start to build lambda and zip it
cd "$LAMBDA_DIR" && npm run build:zip && cd dist && mv lambda.zip "$TERRAFORM_DIR" && cd .. && npm run clean
