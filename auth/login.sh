#!/bin/sh

# Read appropriate configuration parameters
configFile=../config.json
jsonApi=../api/json.js
accountKey=SOLID_ACCOUNT
unameKey=SOLID_UNAME
passKey=SOLID_PASS
account=`node $jsonApi --read --key=$accountKey --json=$configFile`
uname=`node $jsonApi --read --key=$unameKey --json=$configFile`
pass=`node $jsonApi --read --key=$passKey --json=$configFile`
node $jsonApi --read --key= --json=../$configFile

# Login to Solid account
curl -v -H "Content-Type: application/x-www-form-urlencoded" -H "Origin: $1" -c cookies.txt -d "username="$uname"&password="$pass -X POST $account/login/password
cp cookies.txt ../rest
