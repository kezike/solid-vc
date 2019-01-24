#!/bin/sh

# Generate key pair

# Read appropriate configuration parameters
configFile=$PWD/../config.json
jsonApi=$PWD/../api/json.js
pubKeyFileLocLocalKey=PUB_FILE_LOCAL
privKeyFileLocLocalKey=PRIV_FILE_LOCAL
pubKeyFileLocal=`node $jsonApi --read --key=$pubKeyFileLocLocalKey --json=$configFile`
privKeyFileLocal=`node $jsonApi --read --key=$privKeyFileLocLocalKey --json=$configFile`

echo Generating and storing private key in priv.pem...
openssl genrsa -out $privKeyFileLocal 2048
cat $privKeyFileLocal
echo Generating and storing public key in pub.pem...
openssl rsa -in $privKeyFileLocal -pubout -out $pubKeyFileLocal
cat $pubKeyFileLocal
echo HANDLE THESE KEYS WITH CARE! THEY ARE YOUR PRIMARY AUTHENTICATION TOOLS IN SOLID-VC :D
