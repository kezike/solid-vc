var $rdf = require('rdflib');
var fs = require('fs');
var jsonld = require('jsonld');
var jsig = require('jsonld-signatures');
jsig.use('jsonld', jsonld);

async function main() {
    // Load public and private key PEMs
    var testPublicPemFile = "../auth/pub.pem";
    var testPrivatePemFile = "../auth/priv.pem";
    var testPublicKeyPem = "-----BEGIN PUBLIC KEY-----\r\n...";
    var testPrivateKeyPem = "-----BEGIN PRIVATE KEY-----\r\n...";

    async function loadPubKeyPem() {
        let promise = fs.readFile(testPublicPemFile, 'utf8', async (err, content) => {
            testPublicKeyPem = await content;
        });
        // let pubKeyPem = await promise;
        // return pubKeyPem;
    }

    async function loadPrivKeyPem() {
        let promise = fs.readFile(testPrivatePemFile, 'utf8', async (err, content) => {
            testPrivateKeyPem = await content;
        });
        // let privKeyPem = await promise;
        // return privKeyPem;
    }

    // testPublicPemFile = await loadPubKeyPem();
    // testPrivateKeyPem = await loadPrivKeyPem();
    console.log(testPublicKeyPem);
    console.log(testPrivateKeyPem);

    // Specify the public key owner object
    var testPublicKey = {
        "@context": jsig.SECURITY_CONTEXT_URL,
        "@id": "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
        owner: "https://kezike.solid.community/profile/card#me",
        publicKeyPem: testPublicKeyPem
    };

    // Specify the public key owner object
    var testPublicKeyOwner = {
        "@context": jsig.SECURITY_CONTEXT_URL,
        "@id": "https://kezike.solid.community/profile/card#me",
        publicKey: [testPublicKey]
    };

    // Create the JSON-LD document that should be signed
    /*var testDocument = {
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

    var testDocument = {
        "@context": {
          schema: "http://schema.org/",
          name: "schema:name",
          homepage: "schema:url",
          image: "schema:image"
        },
        name: "Kayode Ezike",
        homepage: "https://kayodeezike.com/",
        image: "https://cdn-images-1.medium.com/max/1600/1*io_TxFEasErhkypxUUo8gQ.jpeg"
    };

    // Specifying signature configuration
    var sigConfig = {
      privateKeyPem: testPrivateKeyPem,
      creator: "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
      algorithm: "RsaSignature2018"
    };

    // Sign the document and then verify the signed document
    /*jsig.sign(testDocument, sigConfig, 
        (err, signedDocument) => {
            if(err) {
              return console.log('Signing error:', err);
            }
            console.log('Signed document:', signedDocument);

            // verify the signed document
            jsig.verify(signedDocument, {
              publicKey: testPublicKey,
              publicKeyOwner: testPublicKeyOwner,
            }, (err, verified) => {
                 if(err) {
                   return console.log('Signature verification error:', err);
                 }
                 console.log('Signature is valid:', verified);
               }
            );
        }
    );*/

    // Sign and verify
    setTimeout(() => {
        console.log(testPublicKeyPem);
        console.log(testPrivateKeyPem);
        var sign = jsig.sign(testDocument, sigConfig);
        sign.then((err, signedDoc) => {console.log(err, signedDoc);});
    }, 3000);
    // sign.then((signedDocument) => {console.log("SIGNED DOC:\n", signedDocument);}, (err) => {/*console.error(err);*/});

    /*var verify = jsig.promises.verify(signedDocument, {
      publicKey: testPublicKey,
      publicKeyOwner: testPublicKeyOwner
    });
    verify.then(function(verified) {...}, function(err) {...});*/
}

main();
