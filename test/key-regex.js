// Libraries and dependencies
var fs = require('fs');

// Load public and private key PEMs
var publicKeyPemFile = "../auth/pub.pem";
var publicKeyPem = fs.readFileSync(publicKeyPemFile, 'utf8');
// console.log(publicKeyPem);

var patt =  /(-+BEGIN [a-zA-Z0-9_ ]*-+)(.*?)(-+END [a-zA-Z0-9_ ]*-+)/;
// var patt =  /(-+BEGIN PUBLIC KEY-+\s*)(.*?)(-+END PUBLIC KEY-+\s*)/;
// var patt = /(?<=-----BEGIN PUBLIC KEY----- )(?:\S+|\s(?!-----END PUBLIC KEY-----))+(?=\s-----END PUBLIC KEY-----)/;
var matched = patt.test(publicKeyPem);
var match = patt.exec(publicKeyPem);
console.log("Matched:", matched);
console.log("Match:", match);
