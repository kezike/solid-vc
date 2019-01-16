#!/bin/sh

data=`cat $2`
echo $data
OIFS=$IFS
IFS='/'
fileNamePartsOne=($2)
fileNameNumPartsOne=${#fileNamePartsOne[@]}
fileNameOne=${fileNamePartsOne[fileNameNumPartsOne-1]}
echo fileNameOne: $fileNameOne
echo fileNameNumPartsOne: $fileNameNumPartsOne
IFS='.'
fileNamePartsTwo=($fileNameOne)
fileNameNumPartsTwo=${#fileNamePartsTwo[@]}
fileName=${fileNamePartsTwo[0]}
fileExt=${fileNamePartsTwo[1]}
IFS=$OIFS
echo fileName: $fileName
echo fileExt: $fileExt
curl -v -H "Content-Type: $3" -H "Slug: $fileName" -b cookies.txt --data-raw "$data" -X POST $1
