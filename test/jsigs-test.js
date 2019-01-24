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

// Sample credential similar to credential in jsonld-signautures README.md
var doc1 = {
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

// Credential created by platform
var doc2 = {
    "@context": {
      vc: "https://w3id.org/credentials/v1",
      svc: "http://dig.csail.mit.edu/2018/svc",
      credentialStatus: "vc:credentialStatus",
      description: "svc:description",
      domain: "svc:domain",
      issuerId: "svc:issuerId",
      messageType: "svc:messageType",
      subjectId: "svc:subjectId",
      title: "svc:title"
    },
    "@type": "svc:Credential",
    description: "Congratualations! By the powers vested in me as issuer with ID 'https://kezike17.solid.community/profile/card#me', I hereby grant subject with ID 'https://kezike.solid.community/profile/card#me' a credential of type HEALTH",
    domain: "HEALTH",
    issuerId: "https://kezike17.solid.community/profile/card#me",
    messageType: "ISSUANCE",
    subjectId: "https://kezike.solid.community/profile/card#me",
    title: "HEALTH Credential for Subject with ID 'https://kezike.solid.community/profile/card#me'",
    credentialStatus: "https://kezike.solid.community/public/svc/rev/112"
};

// Specify the public key
var publicKey = {
    "@context": jsigs.SECURITY_CONTEXT_URL,
    type: "RsaVerificationKey2018",
    id: "RsaVerificationKey2018",
    controller: "RsaVerificationKey2018",
    publicKeyPem
};

// Specify the public key controller
var controller = {
    "@context": jsigs.SECURITY_CONTEXT_URL,
    id: "RsaVerificationKey2018",
    publicKey: [publicKey],
    assertionMethod: [publicKey.id]
};

// Specify signature suite and purpose and setup key pair
const {RsaSignature2018} = jsigs.suites;
const {AssertionProofPurpose} = jsigs.purposes;
const {RSAKeyPair} = jsigs;
const key = new RSAKeyPair({...publicKey, privateKeyPem});

// Test 1
async function Test1() {
    console.log("BEGIN TEST 1");
    // Sign the document as a simple assertion
    const signed = await jsigs.sign(doc1, {
      suite: new RsaSignature2018({key}),
      purpose: new AssertionProofPurpose()
    });
    console.log("Signed document:");
    console.log(signed);

    // Verify the signed credential
    const privVer  = null; // We do not know the private key of the signer
    const keyPairVer = new RSAKeyPair({...publicKey, privateKeyPem: privVer});
    const result = await jsigs.verify(signed, {
      suite: new RsaSignature2018({key: keyPairVer}),
      purpose: new AssertionProofPurpose({controller})
    });
    if (result.verified) {
      console.log(`Signature verified: ${result.verified}`);
    } else {
      console.error(`Signature verification error:\n${result.error}`);
    }
    console.log("END TEST 1\n");
}

// Test 2
async function Test2() {
    console.log("BEGIN TEST 2");
    // Sign the document as a simple assertion
    const signed = await jsigs.sign(doc2, {
      suite: new RsaSignature2018({key}),
      purpose: new AssertionProofPurpose()
    });
    console.log("Signed document:");
    console.log(signed);

    // Verify the signed document
    const privVer  = null; // We do not know the private key of the signer
    const keyPairVer = new RSAKeyPair({...publicKey, privateKeyPem: privVer});
    const result = await jsigs.verify(signed, {
      // documentLoader: jsonld.documentLoader,
      suite: new RsaSignature2018({key: keyPairVer}),
      purpose: new AssertionProofPurpose({controller})
    });
    if (result.verified) {
      console.log(`Signature verified: ${result.verified}`);
    } else {
      console.error(`Signature verification error:\n${result.error}`);
    }
    console.log("END TEST 2\n");
}

// Main program
async function main() {
    await Test1();
    await Test2();
}

main();
