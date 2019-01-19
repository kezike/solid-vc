#!/bin/sh

# Publish public key
cd ../rest
./post.sh $keyFolderRemote TODO text/plain
# TODO - Retrieve location of key from previous command
# TODO - Update profile document to point to public key
# ./patch.sh
cd ../auth
