var fs = require('fs');
var jsonld = require('jsonld');
var jsig = require('jsonld-signatures');
jsig.use('jsonld', jsonld);

// Load public and private key PEMs
var testPublicKeyPemFile = "../auth/pub.pem";
var testPrivateKeyPemFile = "../auth/priv.pem";
var testPublicKeyPem = fs.readFileSync(testPublicKeyPemFile, 'utf8');
var testPrivateKeyPem = fs.readFileSync(testPrivateKeyPemFile, 'utf8');
console.log(testPublicKeyPem);
console.log(testPrivateKeyPem);

// Specify the public key owner object
var testPublicKey = {
    "@context": jsig.SECURITY_CONTEXT_URL,
    "@id": "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
    owner: "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
    // owner: "https://kezike.solid.community/profile/card#me",
    publicKeyPem: testPublicKeyPem
};

// Specify the public key owner object
var testPublicKeyOwner = {
    "@context": jsig.SECURITY_CONTEXT_URL,
    // "@id": "https://kezike.solid.community/profile/card#me",
    "@id": "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
    publicKey: [testPublicKey]
};

// Create the JSON-LD document that should be signed
/*
// Sample document to be signed
var testDocument = {
    "@context": "http://www.w3.org/ns/activitystreams",
    "@type": "Create",
    "actor": {
      "@type": "Person",
      "@id": "acct:sally@example.org",
      "displayName": "Sally"
    },
    "object": {
      "@type": "Note",
      "content": "This is a simple note"
    },
    "claim": {
      "ageOver": 21
    }
};*/

// Sample document to be signed
var testDocument = {
    "@context": {
      schema: "http://schema.org",
      name: "schema:name",
      homepage: "schema:url",
      image: "schema:image"
    },
    name: "Kayode Ezike",
    homepage: "https://kayodeezike.com",
    image: "https://cdn-images-1.medium.com/max/1600/1*io_TxFEasErhkypxUUo8gQ.jpeg"
};

// Specifying signature configuration
var signConfig = {
  privateKeyPem: testPrivateKeyPem,
  creator: "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
  algorithm: "LinkedDataSignature2015"
};

// Specifying verification configuration
var verifyConfig = {
  publicKey: testPublicKey,
  publicKeyOwner: testPublicKeyOwner
};

// Sign document
jsig.sign(testDocument, signConfig, (err, signedDocument) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("SIGNED DOC:");
    console.log(signedDocument);
    // Verify document
    jsig.verify(signedDocument, verifyConfig, (err, verified) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("VERIFIED:");
        console.log(verified);
    });
});
