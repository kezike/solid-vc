#!/bin/sh

# Setup solid-vc environment

# Enable execution of solid-vc scripts
chmod +x svc
chmod +x util/*
chmod +x auth/*
chmod +x rest/*
chmod +x ont/*

# Install requisite Node packages and dependencies
echo Installing requisite Node packages...
npm install
npm install solid-auth-client -g
solid-auth-client generate-popup "SolidVC"
# ln -fs node_modules/solid-auth-client/dist-popup/popup.html popup.html

# BEGIN AUTHENTICATION
cd auth/

# Login to Solid account
echo To get started, please provide your Solid account info in the following section. If you do not own a Solid account, please quit this script and register for one here: https://solid.inrupt.com
echo Please enter your Solid account domain \(eg. https://USER.solid.community\) \[ENTER\]: 
read account
echo Please enter your Solid account username \[ENTER\]: 
read uname
echo Please enter your Solid account password \[ENTER\]: 
read pass
export SOLID_UNAME=$uname
export SOLID_PASS=$pass
./login.sh $account

# TODO - Setup necessary svc folders
# Including:
# - /public/svc/keys

# Generate key pair
./generate_keypair.sh

# TODO - Publish public key
echo Please enter an existing public folder where you would like to store your SolidVC public key \(eg. https://USER.solid.community/public/svc/keys\) \[ENTER\]: 
read keyFolderRemote
export SOLID_KEY_FOLDER_REMOTE=$keyFolderRemote
./publish_key.sh

cd ../
# END AUTHENTICATION
