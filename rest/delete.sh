#!/bin/sh

curl -v -H "Content-Type: application/x-www-form-urlencoded" -b cookies.txt -X DELETE $1
