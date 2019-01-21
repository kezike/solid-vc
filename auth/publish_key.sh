#!/bin/sh

# Publish public key
# $1 - remote public key folder
# $2 - local public key file
# $3 - local public key query file
# $4 - profile document card (without fragments, such as '#me')
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
./patch.sh $4 $3
cd ../auth
