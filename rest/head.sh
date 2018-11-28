#!/bin/sh

curl -v -H "Link: rel='http://www.w3.org/ns/ldp#inbox'" -b cookies.txt -X HEAD $1
