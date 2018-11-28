#!/bin/sh

# Setup solid-vc environment

# Enable execution of solid-vc scripts
chmod +x util/*
chmod +x auth/*
chmod +x rest/*

# TODO - Login to POD

# TODO - Setup necessary svc folders

# Generate key pair
auth/generate_keypair.sh

# TODO - Publish public key to svc 'keys' endpoint
auth/publish_key.sh
