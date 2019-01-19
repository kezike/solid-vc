#!/bin/sh

curl -v -H "Link: <https://www.w3.org/ns/ldp#BasicContainer>; rel='type'" -H "Slug: $2" -b cookies.txt -X POST $1
# curl -v -H "Link: <https://www.w3.org/ns/ldp#BasicContainer>; rel='type'" -H "Slug: $2" -H "Content-Type: text/turtle" -b cookies.txt -X POST $1
