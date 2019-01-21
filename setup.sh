#!/bin/sh

# Setup solid-vc environment

# BEGIN SETUP

# BEGIN DEPENDENCY INSTALLATION

# Enable execution of solid-vc scripts
chmod +x svc
chmod +x util/*
chmod +x auth/*
chmod +x rest/*
chmod +x ont/*

# Install requisite Node packages and dependencies
echo Installing requisite Node packages...
npm install
# TODO - Follow up on issue that enables configuration of popup.html app name
ln -fs node_modules/solid-auth-client/dist-popup/popup.html popup.html
# END DEPENDENCY INSTALLATION

# BEGIN AUTHENTICATION
cd auth/

# Login to Solid account
echo To get started, please provide your Solid account info in the following section. If you do not own a Solid account, please quit this script and register for one here: https://solid.inrupt.com
echo Please enter your Solid WebID \(eg. https://USER.solid.community/profile/card#me\) \[ENTER\]: 
read webId
uriApi=$PWD/../api/uri.js
account=`node $uriApi --host=$webId` # NOTE: $PWD == solid-vc/auth at this point
profile=`node $uriApi --doc=$webId` # NOTE: $PWD == solid-vc/auth at this point
echo Please enter your Solid account username \[ENTER\]: 
read uname
echo Please enter your Solid account password \[ENTER\]: 
read pass
export SOLID_UNAME=$uname
export SOLID_PASS=$pass
./login.sh $account

# Generate key pair
privKeyFile=$PWD/priv.pem # NOTE: $PWD == solid-vc/auth at this point
pubKeyFile=$PWD/pub.pem # NOTE: $PWD == solid-vc/auth at this point
./generate_keypair.sh $privKeyFile $pubKeyFile

# TODO - Publish public key
echo Please enter an existing and EMPTY public folder where you would like to store your SolidVC public key \(eg. https://USER.solid.community/public/svc/keys\) \[ENTER\]: 
read keyFolderRemote
pubKeyQueryFile=$PWD/../query/pub.sparql # NOTE: $PWD == solid-vc/auth at this point
./publish_key.sh $keyFolderRemote $pubKeyFile $pubKeyQueryFile $profile

cd ../
# END AUTHENTICATION

# BEGIN REVOCATION LIST CONFIGURATION

# Store revocation list in local file
# TODO - Publish revocation list
echo Please enter an existing EMPTY public folder where you would like to store your SolidVC revocation list \(eg. https://USER.solid.community/public/svc/rev\) \[ENTER\]: 
read revFolderRemote
revListFile=$PWD/data/rev.txt # NOTE: $PWD == solid-vc at this point
echo $revFolderRemote > $revListFile

# END REVOCATION LIST CONFIGURATION

# END MISCELLANEOUS

# END SETUP
