#!/bin/sh

curl -Lv -H "Content-Type: application/x-www-form-urlencoded" -b cookies.txt -X GET $1
