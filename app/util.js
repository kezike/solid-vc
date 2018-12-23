// Solid Verifiable Credentials Utility Library

// Libraries and dependencies
var $rdf = require('rdflib');
var $auth = require('solid-auth-client');
var LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');
var SVC = $rdf.Namespace('http://dig.csail.mit.edu/2018/svc#');
// var fs = require('fs');
/*var jsonld = require('jsonld');
var jsig = require('jsonld-signatures');
jsig.use('jsonld', jsonld);*/

var SolidUtil = SolidUtil || {};

SolidUtil = {
    //// BEGIN REST CONFIGURATION ////
    contentTypeKey: 'content-type',

    contentTypeN3: 'text/n3',

    contentTypePlain: 'text/plain',

    responseTextKey: 'responseText',

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
    //// END REST CONFIGURATION ////

    //// BEGIN KEY MANAGEMENT ////
    pubKeyPemFile: '../auth/pub.pem',

    privKeyPemFile: '../auth/priv.pem',
    //// END KEY MANAGEMENT ////

    //// BEGIN ONTOLOGY METADATA ////
    // Inbox filter for svc messages
    inboxFilter: 'SVC_MSG',

    // SVC ontology public key property
    svcPubKeyField: 'pubKey',

    // SVC ontology public key property
    svcPrivKeyField: 'privKey',

    // LDP ontology inbox property
    ldpInboxField: 'inbox',
    //// END ONTOLOGY METADATA ////

    //// BEGIN APP ////
    // Home page of SolidVC app
    homePage: '/',

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

    // Discover the inbox of a target via LDN
    discoverInbox: async function(target) {
        var inboxPromise = new Promise((resolve, reject) => {
            SolidUtil.fetcher.load(target, SolidUtil.getOptions).then((resp) => {
                var inbox = SolidUtil.fetcher.store.any($rdf.sym(target), LDP(SolidUtil.ldpInboxField), undefined);
                resolve(inbox);
            }).catch((err) => {
               console.error(err.name + ": " + err.message);
               resolve(null);
            });
        });
        var inboxResult = await inboxPromise;
        return inboxResult;
    },

    // Load content of inbox
    loadInbox: async function(inbox) {
        // TODO - Implement me
    },

    // Retrieve URI of svc public key of a remote target
    getPubKeyRemoteURI: async function(target) {
        var pubKeyUriPromise = new Promise((resolve, reject) => {
            SolidUtil.fetcher.load(target, SolidUtil.getOptions).then((resp) => {
                var pubKeyUri = SolidUtil.fetcher.store.any($rdf.sym(target), SVC(SolidUtil.svcPubKeyField), undefined);
                resolve(pubKeyUri);
            }).catch((err) => {
               console.error(err.name + ": " + err.message);
               resolve(null);
            });
        });
        var pubKeyUriResult = await pubKeyUriPromise;
        return pubKeyUriResult;
    },

    // Retrieve content of svc public key of a remote target
    getPubKeyRemoteContent: async function(target) {
        var pubKeyUri = await util.getPubKeyRemoteURI(target);
        var pubKeyPromise = new Promise((resolve, reject) => {
            SolidUtil.fetcher.load(pubKeyUri, SolidUtil.getOptions).then((resp) => {
                resolve(resp[SolidUtil.responseTextKey]);
            }).catch((err) => {
               console.error(err.name + ": " + err.message);
               resolve(null);
            });
        });
        var pubKeyResult = await pubKeyPromise;
        return pubKeyResult;
    },

    // Retrieve content of local file
    readKeyFile: async function (keyFile) {
        var keyPromise = new Promise((resolve, reject) => {
            var rawFile = new XMLHttpRequest();
            rawFile.open("GET", keyFile, false);
            rawFile.onreadystatechange = function () {
                if (rawFile.readyState === 4) {
                  if (rawFile.status === 200 || rawFile.status == 0) {
                    var content = rawFile.responseText;
                    resolve(content);
                  }
                }
            }
            rawFile.send(null);
        });
        var keyResult = await keyPromise;
        return keyResult;
    },

    // Retrieve local svc public key
    getPubKeyLocal: async function() {
        var pubKey = await SolidUtil.readKeyFile(SolidUtil.pubKeyPemFile);
        return pubKey;
    },

    // Retrieve local svc private key
    getPrivKeyLocal: async function() {
        var privKey = await SolidUtil.readKeyFile(SolidUtil.privKeyPemFile);
        return privKey;
    },
    
    // Sign document
    signDocument: async function(doc, /*signConfig*/) {
        // Specifying signature configuration
        // TODO - allow specification of creator and algorithm in signConfig
        var signConfig = {
          privateKeyPem: SolidUtil.getPrivKeyLocal(),
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
            publicKeyPem: SolidUtil.getPubKeyLocal()
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
    //// END APP ////
};

module.exports = SolidUtil;
