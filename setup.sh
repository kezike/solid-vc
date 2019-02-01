#!/bin/sh

# Setup solid-vc environment

# BEGIN SETUP

# BEGIN DEPENDENCY INSTALLATION

# Enable execution of solid-vc scripts
chmod +x auth/*
chmod +x rest/*
chmod +x ont/*

# Install requisite Node packages and dependencies
echo Installing requisite Node packages...
npm install
npm install jsonld
npm install jsonld-signatures
# TODO - Follow up on issue that enables configuration of popup.html app name
ln -fs node_modules/solid-auth-client/dist-popup/popup.html popup.html

# Define all file locations that are relevant for setup
uriApi=$PWD/api/uri.js # NOTE: $PWD == solid-vc at this point
jsonApi=$PWD/api/json.js # NOTE: $PWD == solid-vc at this point
configFile=$PWD/config.json # NOTE: $PWD == solid-vc at this point
pubKeyFileLocal=$PWD/auth/pub.pem # NOTE: $PWD == solid-vc at this point
privKeyFileLocal=$PWD/auth/priv.pem # NOTE: $PWD == solid-vc at this point
pubKeyQueryFile=$PWD/query/pub.sparql # NOTE: $PWD == solid-vc at this point
revListFile=$PWD/data/rev.txt # NOTE: $PWD == solid-vc at this point

# Define all config keys
webidKey=SOLID_WEBID
accountKey=SOLID_ACCOUNT
unameKey=SOLID_UNAME
passKey=SOLID_PASS
pubKeyFileLocalKey=PUB_FILE_LOCAL
privKeyFileLocalKey=PRIV_FILE_LOCAL
pubKeyFolderRemoteKey=PUB_FOLDER_REMOTE
pubKeyQueryFileKey=PUB_QUERY_FILE
profileKey=SOLID_PROFILE
revFolderRemoteKey=REV_FOLDER_REMOTE

# Setup config file
echo {} > $configFile

# END DEPENDENCY INSTALLATION

# BEGIN AUTHENTICATION
cd auth/

# Login to Solid account
echo To get started, please provide your Solid account info in the following section. If you do not own a Solid account, please quit this script and register for one here: https://solid.inrupt.com
printf "Please enter your Solid WebID (eg. https://USER.solid.community/profile/card#me) [ENTER]:\n---> "
read webid
host=`node $uriApi --host=$webid`
protocol=`node $uriApi --protocol=$webid`
account=$protocol://$host/
profile=`node $uriApi --doc=$webid`
printf "Please enter your Solid account username [ENTER]:\n---> "
read uname
printf "Please enter your Solid account password [ENTER]:\n---> "
read pass
node $jsonApi --write --key=$webidKey --value=$webid --json=$configFile
node $jsonApi --write --key=$accountKey --value=$account --json=$configFile
node $jsonApi --write --key=$unameKey --value=$uname --json=$configFile
node $jsonApi --write --key=$passKey --value=$pass --json=$configFile
./login.sh
node $jsonApi --delete --key=$unameKey --json=$configFile
node $jsonApi --delete --key=$passKey --json=$configFile

# Generate key pair
node $jsonApi --write --key=$pubKeyFileLocalKey --value=$pubKeyFileLocal --json=$configFile
node $jsonApi --write --key=$privKeyFileLocalKey --value=$privKeyFileLocal --json=$configFile
./generate_keypair.sh
node $jsonApi --delete --key=$privKeyFileLocalKey --json=$configFile

# Publish public key
printf "Please enter an existing and EMPTY public folder where you would like to store your SolidVC public key (eg. https://USER.solid.community/public/svc/keys) [ENTER]:\n---> "
read pubKeyFolderRemote
node $jsonApi --write --key=$pubKeyFolderRemoteKey --value=$pubKeyFolderRemote/ --json=$configFile
node $jsonApi --write --key=$pubKeyQueryFileKey --value=$pubKeyQueryFile --json=$configFile
node $jsonApi --write --key=$profileKey --value=$profile --json=$configFile
./publish_key.sh
node $jsonApi --delete --key=$pubKeyFileLocalKey --json=$configFile
node $jsonApi --delete --key=$pubKeyQueryFileKey --json=$configFile

cd ../
# END AUTHENTICATION

# BEGIN REVOCATION LIST CONFIGURATION

# Store revocation list in local file
printf "Please enter an existing EMPTY public folder where you would like to store your SolidVC revocation list (eg. https://USER.solid.community/public/svc/rev) [ENTER]:\n---> "
read revFolderRemote
node $jsonApi --write --key=$revFolderRemoteKey --value=$revFolderRemote/ --json=$configFile

# END REVOCATION LIST CONFIGURATION

echo SolidVC setup is complete. Run 'npm start' to get started!

# END SETUP
