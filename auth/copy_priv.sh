#!/bin/sh

# Copy your private key
cat ../priv.pem | tr -d '\n' | pbcopy
