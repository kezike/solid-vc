#!/bin/sh

# Publish public key
# $1 - remote public key folder
# $2 - local public key file
# $3 - local public key query file
# $4 - profile document card (without fragments like '#me')

# Refer to rest directory to access POST and PATCH
restDir=$PWD/../rest

# Read appropriate configuration parameters
configFile=$PWD/../config.json
jsonApi=$PWD/../api/json.js
pubKeyFolderRemoteKey=PUB_FOLDER_REMOTE
pubKeyFileRemoteKey=PUB_FILE_REMOTE
pubKeyFileLocalKey=PUB_FILE_LOCAL
pubKeyQueryFileKey=PUB_QUERY_FILE
profileKey=SOLID_PROFILE
webIdKey=SOLID_WEBID
pubKeyFolderRemote=`node $jsonApi --read --key=$pubKeyFolderRemoteKey --json=$configFile`
pubKeyFileLocal=`node $jsonApi --read --key=$pubKeyFileLocalKey --json=$configFile`
pubKeyQueryFile=`node $jsonApi --read --key=$pubKeyQueryFileKey --json=$configFile`
profile=`node $jsonApi --read --key=$profileKey --json=$configFile`
webId=`node $jsonApi --read --key=$webIdKey --json=$configFile`

# Post public key to Solid pod
$restDir/post.sh $pubKeyFolderRemote $pubKeyFileLocal

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
pubKeyUri=$pubKeyFolderRemote"$fileName".txt

# Write pub key file to config file for future reference
node $jsonApi --write --key=$pubKeyFileRemoteKey --value=$pubKeyUri --json=$configFile

# Update profile document to point to public key
echo "INSERT DATA { <$webId> <https://w3id.org/security#publicKey> \"$pubKeyUri\" }" > $pubKeyQueryFile
$restDir/patch.sh $profile $pubKeyQueryFile
rm $pubKeyQueryFile

