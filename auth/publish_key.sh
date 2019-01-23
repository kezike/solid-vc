#!/bin/sh

# Publish public key
# $1 - remote public key folder
# $2 - local public key file
# $3 - local public key query file
# $4 - profile document card (without fragments like '#me')

# Read appropriate configuration parameters
configFile=../config.json
pubKeyFolderRemoteKey=PUB_FOLDER_REMOTE
pubKeyFileLocalKey=PUB_FILE_LOCAL
pubKeyQueryFileKey=PUB_QUERY_FILE
profileKey=SOLID_PROFILE

pubKeyFolderRemote=`node $jsonApi --read --key=$pubKeyFolderRemoteKey --json=$configFile`
pubKeyFileLocal=`node $jsonApi --read --key=$pubKeyFileLocalKey --json=$configFile`
pubKeyQueryFile=`node $jsonApi --read --key=$pubKeyQueryFileKey --json=$configFile`
profile=`node $jsonApi --read --key=$profileKey --json=$configFile`

cd ../rest
./post.sh $pubKeyFolderRemote $pubKeyFileLocal

# TODO - Retrieve location of key from previous command
# Extract relative file name
IFS='/'
fileNamePartsOne=($pubKeyFileLocal)
fileNameNumPartsOne=${#fileNamePartsOne[@]}
fileNameOne=${fileNamePartsOne[fileNameNumPartsOne-1]}

# Extract file name and file extension
IFS='.'
fileNamePartsTwo=($fileNameOne)
fileNameNumPartsTwo=${#fileNamePartsTwo[@]}
fileName=${fileNamePartsTwo[0]}
fileExt=${fileNamePartsTwo[1]}
IFS=$OIFS
pubKeyUri=$pubKeyFolderRemote/$fileName

# TODO - Update profile document to point to public key
printf "INSERT DATA { <> <https://w3id.org/security#publicKey> " > $pubKeyQueryFile
printf "'$pubKeyUri' }" >> $pubKeyQueryFile
./patch.sh $profile $pubKeyQueryFile
cd ../auth
