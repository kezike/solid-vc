#!/bin/sh

# Generate key pair

echo Generating and storing private key in priv.pem...
openssl genrsa -out $1 2048
cat priv.pem
echo Generating and storing public key in pub.pem...
openssl rsa -in $1 -pubout -out $2
cat $2
echo HANDLE THESE KEYS WITH CARE! THEY ARE YOUR PRIMARY AUTHENTICATION TOOLS IN SOLID-VC :D
