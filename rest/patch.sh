#!/bin/sh

curl -v -H "Content-Type: application/sparql-update" -b cookies.txt -d @$2 -X PATCH $1
