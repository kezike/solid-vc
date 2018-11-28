#!/bin/sh

# Copy your public key
cat ../pub.pem | tr -d '\n' | pbcopy
