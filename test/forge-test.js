var forge = require('node-forge');
var ed25519 = forge.pki.ed25519;
var rsa = forge.pki.rsa;

// generate an RSA key pair asynchronously (uses web workers if available)
// use workers: -1 to run a fast core estimator to optimize # of workers
// *RECOMMENDED* - can be significantly faster than sync -- and will use
// native APIs if available.
var privateKey;
var publicKey;

rsa.generateKeyPair({bits: 2048, workers: 2}, function(err, keypair) {
    privateKey = keypair.privateKey;
    publicKey = keypair.publicKey;
    var md = forge.md.sha256.create();
    md.update('918455098', 'utf8');
    var signature = privateKey.sign(md);
    console.log("forge.md keys:", Object.keys(forge.md) + "\n");
    console.log("md keys:", Object.keys(md) + "\n");
    console.log("privateKey keys:", Object.keys(privateKey) + "\n");
    console.log("publicKey keys:", Object.keys(publicKey) + "\n");
    console.log("signature:", signature + "\n");
});
