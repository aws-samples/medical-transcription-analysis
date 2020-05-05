#!/bin/bash

source .env

#STACK

echo "==update %%CLIENT_APP_BUCKET%% in stack with $2"
replace="s/%%CLIENT_APP_BUCKET%%/$WebAppBucketName/g"
sed -i -e $replace ./lib/medical-transcription-analysis-client-stack.js
