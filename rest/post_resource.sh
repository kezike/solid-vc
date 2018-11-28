#!/bin/sh

data=`cat $2`
echo $data
OIFS=$IFS
IFS='.'
file=($2)
fileName="${file[0]}"
fileExt="${file[1]}"
IFS=$OIFS
# curl -v -H "Content-Type: application/x-www-form-urlencoded" -H "Slug: $2" -b cookies.txt -d "$data" -X POST $1
# curl -v -H "Content-Type: text/$fileExt" -H "Slug: $fileName" -b cookies.txt --data-raw "$data" -X POST $1
curl -v -H "Content-Type: text/plain" -b cookies.txt --data-raw "$data" -X POST $1
