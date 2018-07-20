#!/bin/sh

curl -v -H "Link: <http://www.w3.org/ns/ldp#BasicContainer>; rel='type'" -H "Slug: $2" -b cookies.txt -X POST $1
