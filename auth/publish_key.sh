#!/bin/sh

# Publish public key
cd ../rest
./post.sh $1 $2

# TODO - Retrieve location of key from previous command
# Extract relative file name
IFS='/'
fileNamePartsOne=($2)
fileNameNumPartsOne=${#fileNamePartsOne[@]}
fileNameOne=${fileNamePartsOne[fileNameNumPartsOne-1]}

# Extract file name and file extension
IFS='.'
fileNamePartsTwo=($fileNameOne)
fileNameNumPartsTwo=${#fileNamePartsTwo[@]}
fileName=${fileNamePartsTwo[0]}
fileExt=${fileNamePartsTwo[1]}
IFS=$OIFS
pubKeyUri=$1/$fileName

# TODO - Update profile document to point to public key
echo "INSERT DATA { <> <https://w3id.org/security#publicKey> $pubKeyUri }" > $3
./patch.sh $pubKeyUri $3
cd ../auth
