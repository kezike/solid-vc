// Solid Verifiable Credentials Utility Library

// Libraries and dependencies
var $rdf = require('rdflib');
var $auth = require('solid-auth-client');
var LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');
// var fs = require('fs');
/*var jsonld = require('jsonld');
var jsig = require('jsonld-signatures');
jsig.use('jsonld', jsonld);*/

var SolidUtil = SolidUtil || {};

SolidUtil = {
    // REST configuration
    contentTypeKey: 'content-type',

    contentTypeN3: 'text/n3',

    contentTypePlain: 'text/plain',

    headOptions: {
      method: 'HEAD'/*,
      clearPreviousData: true*/
    },

    getOptions: {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      clearPreviousData: true
    },

    postOptions: {
      method: 'POST',
      headers: {
        'content-type': 'text/n3'
      },
      mode: 'cors',
      credentials: 'include',
      /*body: "@prefix : <#>.\n@prefix c: <https://kezike17/solidtest.space/profile/card#>.\n@prefix n0: <http://xmlns.com/foaf/0.1/>.\n@prefix     c0: <https://www.w3.org/People/Berners-Lee/card#>.\nc:me n0:knows c0:i.",*/
      body: "REPLACE ME BEFORE USAGE"
    },

    // Key management
    pubKeyType: 'PUB',

    privKeyType: 'PRIV',

    pubKeyPemFile: '../auth/pub.pem',

    privKeyPemFile: '../auth/priv.pem',

    // Home page of SolidVC app
    homePage: '/',
    
    // Inbox filter for svc messages
    inboxFilter: 'SVC_MSG',

    // Bind val to key in obj
    bindKeyValue: function(obj, key, val) {
        obj[key] = val;
    },

    // Login as a different user
    switchAccounts: function(event) {
        /*SolidVC.logout().then(() => {
            SolidVC.login();
        });*/
        console.log("Switching Accounts...")
    },

    // Change role in Verifiable Credentials ecosystem
    switchRoles: function(event) {
        console.log("Switching Roles...")
        window.location.href = SolidUtil.homePage;
    },

    // Retrieve the inbox of a target
    getInbox: async function(target) {
        var inboxPromise = new Promise((resolve, reject) => {
            SolidUtil.fetcher.load(target, SolidUtil.getOptions).then((resp) => {
                var inbox = SolidUtil.fetcher.store.any($rdf.sym(target), LDP('inbox'), undefined);
                resolve(inbox);
            }).catch((err) => {
               console.error(err.name + ": " + err.message);
               return resolve(null);
            });
        });
        var inboxResult = await inboxPromise;
        return inboxResult;
    },
    
    readFile: function (file, keyType) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
              if (rawFile.status === 200 || rawFile.status == 0) {
                var content = rawFile.responseText;
                switch (keyType) {
                  case SolidUtil.pubKeyType:
                    SolidUtil.pubKey = content;
                  case SolidUtil.privKeyType:
                    SolidUtil.privKey = content;
                }
              }
            }
        }
        rawFile.send(null);
    },

    getPubKey: function() {
        /*fs.readFile(SolidUtil.pubKeyPemFile, 'utf8', function(err, content) {
            console.log(content);
            return content;
        });*/
        SolidUtil.readFile(SolidUtil.pubKeyPemFile, SolidUtil.pubKeyType);
        var pubKey = SolidUtil.pubKey;
        SolidUtil.pubKey = "";
        return pubKey;
    },

    getPrivKey: function() {
        /*fs.readFile(SolidUtil.privKeyPemFile, 'utf8', function(err, content) {
            console.log(content);
            return content;
        });*/
        SolidUtil.readFile(SolidUtil.privKeyPemFile, SolidUtil.privKeyType);
        var privKey = SolidUtil.privKey;
        SolidUtil.privKey = "";
        return privKey;
    },
    
    // Sign document
    signDocument: async function(doc, /*signConfig*/) {
        // Specifying signature configuration
        // TODO - allow specification of creator and algorithm in signConfig
        var signConfig = {
          privateKeyPem: SolidUtil.getPrivKey(),
          creator: "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
          algorithm: "LinkedDataSignature2015"
        };
        jsig.sign(doc, signConfig, (err, signedDocument) => {
            if (err) {
              console.log(err);
              return;
            }
            console.log("SIGNED DOC:");
            console.log(signedDocument);
            return signedDocument;
        });
    },

    // Verify document
    verifyDocument: async function(signedDoc, /*verifyConfig*/) {
        // Specifying verification configuration
        // TODO - allow specification of publicKey["@id"], publicKey.owner, and publicKeyOwner["@id"] in verifyConfig
        // Specify the public key owner object
        var publicKey = {
            "@context": jsig.SECURITY_CONTEXT_URL,
            "@id": "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
            owner: "https://kezike.solid.community/profile/card#me",
            publicKeyPem: SolidUtil.getPubKey()
        };
        // Specify the public key owner object
        var publicKeyOwner = {
            "@context": jsig.SECURITY_CONTEXT_URL,
            "@id": "https://kezike.solid.community/profile/card#me",
            publicKey: [publicKey]
        };
        var verifyConfig = {
          publicKey: publicKey,
          publicKeyOwner: publicKeyOwner
        };
        jsig.verify(signedDoc, verifyConfig, (err, verified) => {
            if (err) {
              console.log(err);
              return;
            }
            console.log("VERIFIED:");
            console.log(verified);
            return verified;
        });
    }
};

module.exports = SolidUtil;
