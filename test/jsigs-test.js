// Libraries and dependencies
var fs = require('fs');
var jsonld = require('jsonld');
var jsigs = require('jsonld-signatures');
// jsigs.use('jsonld', jsonld);

// Load public and private key PEMs
var publicKeyPemFile = "../auth/pub.pem";
var privateKeyPemFile = "../auth/priv.pem";
var publicKeyPem = fs.readFileSync(publicKeyPemFile, 'utf8');
var privateKeyPem = fs.readFileSync(privateKeyPemFile, 'utf8');
console.log(publicKeyPem);
console.log(privateKeyPem);

/*
// Specify the public key owner object
var publicKey = {
    "@context": jsigs.SECURITY_CONTEXT_URL,
    "@id": "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
    owner: "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
    // owner: "https://kezike.solid.community/profile/card#me",
    publicKeyPem: publicKeyPem
};

// Specify the public key owner object
var publicKeyOwner = {
    "@context": jsigs.SECURITY_CONTEXT_URL,
    // "@id": "https://kezike.solid.community/profile/card#me",
    "@id": "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
    publicKey: [publicKey]
};

// Specifying signature configuration
var signConfig = {
  privateKeyPem: privateKeyPem,
  creator: "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
  algorithm: "LinkedDataSignature2015"
};

// Specifying verification configuration
var verifyConfig = {
  publicKey: publicKey,
  publicKeyOwner: publicKeyOwner
};

// Sample document to be signed
var doc = {
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

// Sign document
jsigs.sign(doc, signConfig, (err, signedDoc) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("SIGNED DOC:");
    console.log(signedDoc);
    // Verify document
    jsigs.verify(signedDoc, verifyConfig, (err, verified) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("VERIFIED:");
        console.log(verified);
    });
});*/

// Main program
async function main() {
    // Specify the public key owner object
    var publicKey = {
        "@context": jsigs.SECURITY_CONTEXT_URL,
        type: "RsaVerificationKey2018",
        id: /*"https://kezike.solid.community/public/svc/keys/1f36eb50-18de-11e9-a29e-5d8e3e616ac9.txt"*/"publicKey",
        controller: /*"https://kezike.solid.community/public/ctr/bf443590-1531-11e9-a29e-5d8e3e616ac9.txt"*/"controller",
        publicKeyPem
    };

    // Specify the public key owner object
    var controller = {
        "@context": jsigs.SECURITY_CONTEXT_URL,
        id: "https://kezike.solid.community/profile/card#me",
        publicKey: [publicKey],
        assertionMethod: [publicKey.id]
    };

    // Sample document to be signed
    var doc = {
        "@context": {
          schema: "http://schema.org",
          name: "schema:name",
          homepage: "schema:url",
          image: "schema:image"
        },
        name: "Kayode Ezike",
        homepage: "https://kayodeyezike.com",
        image: "https://cdn-images-1.medium.com/max/1600/1*io_TxFEasErhkypxUUo8gQ.jpeg"
    };

    // Sign the document as a simple assertion
    const {RsaSignature2018} = jsigs.suites;
    const {AssertionProofPurpose} = jsigs.purposes;
    const {RSAKeyPair} = jsigs;
    const key = new RSAKeyPair({...publicKey, privateKeyPem});
    const signed = await jsigs.sign(doc, {
      suite: new RsaSignature2018({key}),
      purpose: new AssertionProofPurpose()
    });
    console.log('Signed document:', signed);
    // console.log('Signer public key:', signed['https://w3id.org/security#proof']['@graph']['https://w3id.org/security#verificationMethod']['@id']);

    // Verify the signed document
    const privVer  = null; // You do not know the private key of the signer
    const keyPairVer = new RSAKeyPair({...publicKey, privateKeyPem: privVer});
    const result = await jsigs.verify(signed, {
      // documentLoader: jsonld.documentLoader,
      suite: new RsaSignature2018({key: keyPairVer}),
      purpose: new AssertionProofPurpose({controller})
    });
    if (result.verified) {
      console.log('Signature verified.');
    } else {
      console.log('Signature verification error:', result.error);
    }
}

main();
