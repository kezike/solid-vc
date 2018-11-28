#!/bin/sh

# curl -v -H "Content-Type: application/x-www-form-urlencoded" -H "Origin: $1" -c cookies.txt -d "username="$SOLID_UNAME"&password="$SOLID_PASS -X POST $1/login/tls
curl -v -H "Content-Type: application/x-www-form-urlencoded" -H "Origin: $1" -c cookies.txt -d "username="$SOLID_UNAME"&password="$SOLID_PASS -X POST $1/login/password
