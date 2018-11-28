#!/bin/sh

# Generate key pair

echo Generating and storing private key in priv.pem...
openssl genrsa -out priv.pem
cat priv.pem
echo Generating and storing public key in pub.pem...
openssl rsa -in priv.pem -pubout -out pub.pem
cat pub.pem
echo HANDLE THESE KEYS WITH CARE! THEY ARE YOUR PRIMARY AUTHENTICATION TOOLS IN SOLID-VC :D
