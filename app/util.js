// Solid Verifiable Credentials Utility Library

// Libraries and dependencies
var $rdf = require('rdflib');
var $auth = require('solid-auth-client');
// var exec = require('child_process').exec, child;
// var fs = require('fs');
var jsonld = require('jsonld');
var jsigs = require('jsonld-signatures');
var SOLID = $rdf.Namespace('http://www.w3.org/ns/solid/terms#');
var SVC = $rdf.Namespace('http://dig.csail.mit.edu/2018/svc#');
var SEC = $rdf.Namespace('https://w3id.org/security#');
var LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');

var SolidUtil = SolidUtil || {};

SolidUtil = {
    //// BEGIN REST CONFIGURATION ////
    contentTypeField: 'content-type',

    contentTypePlain: 'text/plain',

    contentTypeN3: 'text/n3',

    contentTypeJsonLd: 'application/ld+json',

    responseTextField: 'responseText',

    headOptions: {
      method: 'HEAD',
      clearPreviousData: true
    },

    getOptions: {
      method: 'GET',
      mode: 'cors',
      withCredentials: true,
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
    // SVC ontology namespace
    SVC: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc#'),

    // LDP ontology namespace
    LDP: $rdf.Namespace('http://www.w3.org/ns/ldp#'),

    // Inbox filter for svc messages
    inboxFilter: 'SVC_MSG',

    // SVC ontology public key predicate
    svcPubKeyField: 'publicKey',

    // SOLID ontology account predicate
    solidAccountField: 'account',

    // LDP ontology `inbox` predicate
    ldpInboxField: 'inbox',

    // LDP ontology `contains` predicate
    ldpContainsField: 'contains',
    //// END ONTOLOGY METADATA ////

    //// BEGIN APP ////
    // Home page of SolidVC app
    homePage: '/',

    popupUri: 'popup.html',

    // Initialize app
    init: function(event) {
        // SolidUtil.login();
        // console.log('$auth.fetch:', $auth.fetch);
    },

    // Bind val to key in obj
    bindKeyValue: function(obj, key, val) {
        obj[key] = val;
    },

    // Login helper function
    loginHelper: function(session) {
        SolidUtil.session = session;
        console.log("SolidUtil.session:", SolidUtil.session);
        SolidUtil.fetcher = $rdf.fetcher($rdf.graph());
        console.log("SolidUtil.fetcher:", SolidUtil.fetcher);
        SolidUtil.updater = new $rdf.UpdateManager(SolidUtil.fetcher.store);
        SolidUtil.bindKeyValue(SolidUtil, 'THIS', $rdf.Namespace($rdf.uri.docpart(SolidUtil.session.webId) + '#'));
        SolidUtil.bindKeyValue(SolidUtil, 'session', SolidUtil.session);
        SolidUtil.bindKeyValue(SolidUtil, 'fetcher', SolidUtil.fetcher);
        /*SolidUtil.bindKeyValue(subject, 'session', SolidUtil.session);
        SolidUtil.bindKeyValue(subject, 'fetcher', SolidUtil.fetcher);
        SolidUtil.bindKeyValue(issuer, 'session', SolidUtil.session);
        SolidUtil.bindKeyValue(issuer, 'fetcher', SolidUtil.fetcher);
        SolidUtil.bindKeyValue(verifier, 'session', SolidUtil.session);
        SolidUtil.bindKeyValue(verifier, 'fetcher', SolidUtil.fetcher);*/
    },

    // Login to app
    login: function() {
        $auth.currentSession().then(/*async */(currentSession) => {
            if (!currentSession) {
              $auth.popupLogin({popupUri: SolidUtil.popupUri}).then(/*async */(popupSession) => {
                  SolidUtil.loginHelper(popupSession);
                  /*var inbox = "https://kezike.solid.community/inbox/";
                  console.log("INBOX:\n" + inbox);
                  var inboxContent = await SolidUtil.loadInbox(inbox);
                  console.log("INBOX CONTENT:\n" + inboxContent);*/
                  // $auth.fetch("https://kezike.solid.community/inbox/6c7eeec0-053e-11e9-a29e-5d8e3e616ac9.txt", SolidUtil.getOptions).then(console.log);
              }).catch((err) => {
                 console.error(err.name + ": " + err.message);
              });
              return;
            }
            SolidUtil.loginHelper(currentSession);
            /*var inbox = "https://kezike.solid.community/inbox/";
            console.log("INBOX:\n" + inbox);
            var inboxContent = await SolidUtil.loadInbox(inbox);
            console.log("INBOX CONTENT:\n" + inboxContent);*/
            // $auth.fetch("https://kezike.solid.community/inbox/6c7eeec0-053e-11e9-a29e-5d8e3e616ac9.txt", SolidUtil.getOptions).then(console.log);
        }).catch((err) => {
           console.error(err.name + ": " + err.message);
        });
    },

    logout: function() {
        // localStorage.removeItem("solid-auth-client");
        // localStorage.clear();
        return $auth.logout();
    },

    // Login as a different user
    switchAccounts: function(event) {
        /*SolidUtil.logout().then(() => {
            SolidUtil.login();
        });*/
        console.log("Switching Accounts...")
    },

    // Change role in Verifiable Credentials ecosystem
    switchRoles: function(event) {
        console.log("Switching Roles...")
        window.location.href = SolidUtil.homePage;
    },

    /*// Execute shell command
    execShell: async function(cmd) {
        return new Promise(function (resolve, reject) {
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({ stdout, stderr });
                }
            });
        });
    },*/

    // Discover the account of a target via LDN
    discoverAccount: async function(target) {
        var accountPromise = new Promise((resolve, reject) => {
            SolidUtil.fetcher.load(target, SolidUtil.getOptions).then((resp) => {
                var account = SolidUtil.fetcher.store.any($rdf.sym(target), SOLID(SolidUtil.solidAccountField), undefined);
                resolve(account.value);
            }).catch((err) => {
               // console.error(err.name + ": " + err.message);
               reject(err);
            });
        });
        var accountResult = await accountPromise;
        return accountResult;
    },

    // Discover the inbox of a target via LDN
    discoverInbox: async function(target) {
        var inboxPromise = new Promise((resolve, reject) => {
            SolidUtil.fetcher.load(target, SolidUtil.getOptions).then((resp) => {
                var inbox = SolidUtil.fetcher.store.any($rdf.sym(target), LDP(SolidUtil.ldpInboxField), undefined);
                resolve(inbox.value);
            }).catch((err) => {
               // console.error(err.name + ": " + err.message);
               reject(err);
            });
        });
        var inboxResult = await inboxPromise;
        return inboxResult;
    },

    // Load content of inbox
    loadInbox: async function(inbox) {
        var inboxPromise = new Promise((resolve, reject) => {
            /*SolidUtil.fetcher.load(inbox, SolidUtil.getOptions).then((resp) => {
                // resolve(resp);
                // resolve(resp.body);
                resolve(resp[SolidUtil.responseTextField]);
                // var inboxContent = SolidUtil.fetcher.store.any($rdf.sym(inbox), LDP(SolidUtil.ldpContainsField), undefined);
                // resolve(inboxContent);
            }).catch((err) => {
               // console.error(err.name + ": " + err.message);
               reject(err);
            });*/
            fetch('https://kezike.solid.community/public/keys/0516d000-1532-11e9-a29e-5d8e3e616ac9.txt').then(function(resp) {
                return resp.json();
            }).then(function(respJson) {
               console.log(JSON.stringify(respJson));
            });
        });
        var inboxResult = await inboxPromise;
        return inboxResult;
    },

    // Retrieve URI of svc public key of a remote target
    getPubKeyRemoteUri: async function(/*target*/account) {
        /*var pubKeyUriPromise = new Promise((resolve, reject) => {
            SolidUtil.fetcher.load(target, SolidUtil.getOptions).then((resp) => {
                var pubKeyUri = SolidUtil.fetcher.store.any($rdf.sym(target), SEC(SolidUtil.svcPubKeyField), undefined);
                resolve(pubKeyUri);
            }).catch((err) => {
               console.error(err.name + ": " + err.message);
               reject(err);
            });
        });
        var pubKeyUriResult = await pubKeyUriPromise;
        return pubKeyUriResult;*/
        var pubKeyUriPromise = new Promise((resolve, reject) => {
            /*var account = await SolidUtil.discoverAccount(target);
            console.log("account:", account.value);
            var accountHardCoded = 'https://kezike.solid.community/';
            console.log("accountHardCoded:", accountHardCoded);
            console.log("account == accountHardCoded:", account.value == accountHardCoded);
            console.log("account === accountHardCoded:", account.value === accountHardCoded);*/
            var pubKeyFolder = account + 'public/keys/';
            console.log("pubKeyFolder:", pubKeyFolder);
            SolidUtil.fetcher.load(pubKeyFolder, SolidUtil.getOptions).then((resp) => {
                var pubKeyUri = SolidUtil.fetcher.store.any($rdf.sym(pubKeyFolder), LDP(SolidUtil.ldpContainsField), undefined);
                console.log("pubKeyUri:", pubKeyUri);
                resolve(pubKeyUri.value);
            }).catch((err) => {
               reject(err);
            });
            /*var pubKeyUri = SolidUtil.fetcher.store.any($rdf.sym(pubKeyFolder), LDP(SolidUtil.ldpContainsField), undefined);
            console.log("pubKeyUri:", pubKeyUri);
            resolve(pubKeyUri);*/
            /*var pubKeyUriSubPromise = new Promise((resolve, reject) => {
                SolidUtil.fetcher.load(pubKeyFolder, SolidUtil.getOptions).then((resp) => {
                    var pubKeyUri = SolidUtil.fetcher.store.any($rdf.sym(pubKeyFolder), LDP(SolidUtil.ldpContainsField), undefined);
                    console.log("pubKeyUri:", pubKeyUri);
                    resolve(pubKeyUri);
                }).catch((err) => {
                   reject(err);
                });
            });
            var pubKeyUriSubResult = await pubKeyUriSubPromise;
            resolve(pubKeyUriSubResult);*/
        });
        var pubKeyUriResult = await pubKeyUriPromise;
        return pubKeyUriResult;
        // return pubKeyRemoteUri;
    },

    // Retrieve content of svc public key of a remote target
    getPubKeyRemoteContent: async function(/*target*/pubKeyUri) {
        /*var pubKeyUri = await SolidUtil.getPubKeyRemoteUri(target);*/
        var pubKeyPromise = new Promise((resolve, reject) => {
            SolidUtil.fetcher.load(/*pubKeyUri*/"https://kezike.solid.community/public/keys/0516d000-1532-11e9-a29e-5d8e3e616ac9.txt", SolidUtil.getOptions).then((resp) => {
                resolve(resp[SolidUtil.responseTextField]);
                /*var pubKeyContent = SolidUtil.fetcher.store.any($rdf.sym(target), LDP(SolidUtil.ldpContainsField), undefined);
                resolve(pubKeyContent);*/
                // resolve(resp.body);
                // var respClone = resp.clone();
                // return resp.clone();
            })/*.then((respClone) => {
               resolve(respClone.text());
            })*/.catch((err) => {
               // console.error(err.name + ": " + err.message);
               reject(err);
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
        /*var signConfig = {
          privateKeyPem: SolidUtil.getPrivKeyLocal(),
          creator: "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
          algorithm: "LinkedDataSignature2015"
        };*/
        const {RsaSignature2018} = jsigs.suites;
        const {AssertionProofPurpose} = jsigs.purposes;
        const {RSAKeyPair} = jsigs;
        const publicKey = SolidUtil.getPrivKeyLocal();
        const privateKeyPem = SolidUtil.getPrivKeyLocal();
        const key = new RSAKeyPair({...publicKey, privateKeyPem});
        var signConfig = {
          // documentLoader: jsonld.documentLoader,
          suite: "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
          purpose: "LinkedDataSignature2015"
        };
        jsigs.sign(doc, signConfig, (err, signedDocument) => {
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
            "@context": jsigs.SECURITY_CONTEXT_URL,
            "@id": "https://kezike.solid.community/public/svc/keys/8770fc10-f31d-11e8-a29e-5d8e3e616ac9.txt",
            owner: "https://kezike.solid.community/profile/card#me",
            publicKeyPem: SolidUtil.getPubKeyLocal()
        };
        // Specify the public key owner object
        var publicKeyOwner = {
            "@context": jsigs.SECURITY_CONTEXT_URL,
            "@id": "https://kezike.solid.community/profile/card#me",
            publicKey: [publicKey]
        };
        var verifyConfig = {
          publicKey: publicKey,
          publicKeyOwner: publicKeyOwner
        };
        jsigs.verify(signedDoc, verifyConfig, (err, verified) => {
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

// $(window).on('load', SolidUtil.init);
module.exports = SolidUtil;
