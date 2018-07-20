#!/bin/sh

data=`cat $2`
echo $data
curl -v -H "Content-Type: application/x-www-form-urlencoded" -H "Slug: resource" -b cookies.txt -d "$data" -X POST $1
