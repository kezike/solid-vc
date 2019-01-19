// Solid Verifiable Credentials Utility Library

// Libraries and dependencies
var $rdf = require('rdflib');
var $auth = require('solid-auth-client');
// var exec = require('child_process').exec, child;
// var fs = require('fs');
var jsonld = require('jsonld');
var jsigs = require('jsonld-signatures');
var downloader = require('file-saver');
var SOLID = $rdf.Namespace('http://www.w3.org/ns/solid/terms#');
var FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
var SVC = $rdf.Namespace('http://dig.csail.mit.edu/2018/svc#');
var SEC = $rdf.Namespace('https://w3id.org/security#');
var LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');

var SolidUtil = SolidUtil || {};

SolidUtil = {
    //// BEGIN REST CONFIGURATION ////
    contentTypeField: 'content-type',
    responseTextField: 'responseText',
    contentTypePlain: 'text/plain',
    contentTypeN3: 'text/n3',
    contentTypeN4: 'application/n-quads',
    contentTypeJsonLd: 'application/ld+json',
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
        'content-type': 'text/n3' // REPLACE ME BEFORE USAGE
      },
      mode: 'cors',
      credentials: 'include',
      body: "" // REPLACE ME BEFORE USAGE
    },
    //// END REST CONFIGURATION ////

    //// BEGIN KEY MANAGEMENT ////
    pubKeyPemFile: '../auth/pub.pem',
    privKeyPemFile: '../auth/priv.pem',
    //// END KEY MANAGEMENT ////

    //// BEGIN GENERAL SOLID/LD TERMS ////
    // Statement subject field
    ldSubField: 'subject',
    // Statement predicate field
    ldPredField: 'predicate',
    // Statement object field
    ldObjField: 'object',
    // Statement source field
    ldSrcField: 'why',
    // Type of term
    ldTermTypeField: 'termType',
    // Value of item
    ldTermValueField: 'value',
    //// BEGIN GENERAL SOLID/LD TERMS ////

    //// BEGIN ONTOLOGY METADATA ////
    // SVC ontology namespace
    SVC: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc#'),
    // LDP ontology namespace
    LDP: $rdf.Namespace('http://www.w3.org/ns/ldp#'),
    // Inbox filter for svc messages
    inboxFilter: 'SVC_MSG',
    // SEC ontology public key predicate
    secPubKeyField: 'publicKey',
    // SEC ontology owner predicate
    secOwnerField: 'owner',
    // SEC ontology controller predicate
    secControllerField: 'controller',
    // SOLID ontology account predicate
    solidAccountField: 'account',
    // LDP ontology `inbox` predicate
    ldpInboxField: 'inbox',
    // LDP ontology `contains` predicate
    ldpContainsField: 'contains',
    foafHomepageField: 'homepage',
    //// END ONTOLOGY METADATA ////

    //// BEGIN APP ////
    // Home page of SolidVC app
    homePage: '/',

    popupUri: 'popup.html',

    // Initialize app
    init: async function(event) {
        // SolidUtil.login();
        // console.log('$auth.fetch:', $auth.fetch);
    },

    // Bind val to key in obj
    bindKeyValue: function(obj, key, val) {
        obj[key] = val;
    },

    // Track status of user session
    trackSession: async function() {
        var sessionPromise = new Promise((resolve, reject) => {
            $auth.trackSession(async (session) => {
                if (!session) {
                  var newSession = await SolidUtil.login();
                  console.log(`Refreshed session:\n${newSession}`);
                  resolve(newSession);
                } else {
                  console.log(`Same session:\n${session}`);
                  resolve(session);
                }
            });
        });
        var sessionResult = await sessionPromise;
        return sessionResult;
    },

    // Login helper function
    loginHelper: async function(session) {
        SolidUtil.session = session;
        console.log(`SolidUtil.session:\n${SolidUtil.session}`);
        SolidUtil.fetcher = $rdf.fetcher($rdf.graph());
        console.log(`SolidUtil.fetcher:\n${SolidUtil.fetcher}`);
        // SolidUtil.updater = new $rdf.UpdateManager(SolidUtil.fetcher.store);
        // SolidUtil.bindKeyValue(SolidUtil, 'THIS', $rdf.Namespace($rdf.uri.docpart(SolidUtil.session.webId) + '#'));
        // var inbox = "https://kezike.solid.community/inbox/";
        var inbox = await SolidUtil.discoverInbox(SolidUtil.session.webId);
        SolidUtil.bindKeyValue(SolidUtil, SolidUtil.ldpInboxField, inbox);
        SolidUtil.bindKeyValue(SolidUtil, 'session', SolidUtil.session);
        SolidUtil.bindKeyValue(SolidUtil, 'fetcher', SolidUtil.fetcher);
    },

    // Login to app
    login: async function() {
        console.log("Logging In...")
        var session = await $auth.currentSession();
        if (!session) {
          session = await $auth.popupLogin({popupUri: SolidUtil.popupUri});
        }
        await SolidUtil.loginHelper(session);
    },

    logout: function() {
        console.log("Logging Out...")
        // localStorage.removeItem("solid-auth-client");
        // localStorage.clear();
        return $auth.logout();
    },

    // Login as a different user
    switchAccounts: function(event) {
        console.log("Switching Accounts...")
        /*SolidUtil.logout().then(() => {
            SolidUtil.login();
        });*/
    },

    // Change role in Verifiable Credentials ecosystem
    switchRoles: function(event) {
        console.log("Switching Roles...")
        window.location.href = SolidUtil.homePage;
    },

    /*// Execute shell command
    execShell: async function(cmd) {
        return new Promise((resolve, reject) => {
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({ stdout, stderr });
                }
            });
        });
    },*/

    // Parse raw text of certain type into graph store
    parse: async function(text, store, base, type) {
        var parsePromise = new Promise((resolve, reject) => {
            $rdf.parse(text, store, base, type, (errParse, resParse) => {
                if (errParse) {
                  reject(errParse);
                }
                resolve(resParse);
            });
        });
        var parseResult = await parsePromise;
        return parseResult;
    },

    // Serialize graph store into raw text of certain type
    serialize: async function(target, store, base, type) {
        var serializePromise = new Promise((resolve, reject) => {
            $rdf.serialize(target, store, base, type, (errSer, resSer) => {
                if (errSer) {
                  resolve(errSer);
                }
                resolve(resSer);
            }, {});
        });
        var serializeResult = await serializePromise;
        return serializeResult;
    },

    // Convert from typeFrom to typeTo
    convert: async function(text, typeFrom, typeTo) {
        var store = $rdf.graph();
        var base = SolidUtil.session.webId;
        var parsed = await SolidUtil.parse(text, store, base, typeFrom);
        var target = null;
        var serialized = await SolidUtil.serialize(target, parsed, base, typeTo);
        return serialized;
    },

    // Retrieve generic json content at target
    genericFetchJson: async function(target) {
        var promise = new Promise(async (resolve, reject) => {
            fetch(target).then(function(resp) {
                return resp.json();
            }).then(function(respJson) {
               resolve(JSON.stringify(respJson));
            }).catch((err) => {
               reject(err);
            });
        });
        var result = await promise;
        return result;
    },

    // Discover the account of a target via LDN
    discoverAccount: async function(target) {
        var accountPromise = new Promise((resolve, reject) => {
            SolidUtil.fetcher.load(target, SolidUtil.getOptions).then((resp) => {
                var account = SolidUtil.fetcher.store.any($rdf.sym(target), SOLID(SolidUtil.solidAccountField), undefined);
                resolve(account.value);
            }).catch((err) => {
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
               reject(err);
            });
        });
        var inboxResult = await inboxPromise;
        return inboxResult;
    },

    // Load content of inbox
    loadInbox: async function(inbox) {
        var inboxPromise = await SolidUtil.fetcher.load(inbox);
        var inboxContent = SolidUtil.fetcher.store.match($rdf.sym(inbox), LDP(SolidUtil.ldpContainsField), undefined);
        return inboxContent;
    },

    // Retrieve URI of svc public key of a remote target
    getPubKeyRemoteUri: async function(target) {
        var pubKeyUriPromise = new Promise((resolve, reject) => {
            SolidUtil.fetcher.load(target, SolidUtil.getOptions).then((resp) => {
                var pubKeyUri = SolidUtil.fetcher.store.any($rdf.sym(target), SEC(SolidUtil.secPubKeyField), undefined);
                resolve(pubKeyUri.value);
            }).catch((err) => {
               reject(err);
            });
        });
        var pubKeyUriResult = await pubKeyUriPromise;
        return pubKeyUriResult;
    },

    // Retrieve content of svc public key of a remote target
    getPubKeyRemoteContent: async function(target) {
        var pubKeyUri = await SolidUtil.getPubKeyRemoteUri(target);
        var pubKeyPromise = new Promise(async (resolve, reject) => {
            /*SolidUtil.fetcher.load(pubKeyUri, SolidUtil.getOptions).then((resp) => {
                // resolve(resp[SolidUtil.responseTextField]);
                // var pubKeyContent = SolidUtil.fetcher.store.any($rdf.sym(target), LDP(SolidUtil.ldpContainsField), undefined);
                // resolve(pubKeyContent);
                var respClone = resp.clone();
                return respClone.json();
            }).then(function(respJson) {
               resolve(JSON.stringify(respJson));
            }).catch((err) => {
               reject(err);
            });*/
            fetch(pubKeyUri).then(function(resp) {
                return resp.json();
            }).then(function(respJson) {
               resolve(JSON.stringify(respJson));
            }).catch((err) => {
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

    // Download content to local file
    writeKeyFile: async function (keyFile, data) {
        /*var keyPromise = new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", keyFile, false);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function () {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                  console.log("Ready state has changed");
                }
            }
            xhr.send(data);
        });
        var keyResult = await keyPromise;
        return keyResult;*/
        var blob = new Blob(data, {type: "text/plain;charset=utf-8"});
        downloader.saveAs(blob, keyFile);
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
        // const publicKeyStr = await SolidUtil.getPubKeyRemoteContent(SolidUtil.session.webId);
        // const publicKey = JSON.parse(publicKeyStr);
        const publicKeyPem = await SolidUtil.getPubKeyLocal();
        const privateKeyPem = await SolidUtil.getPrivKeyLocal();
        var publicKey = {
            "@context": jsigs.SECURITY_CONTEXT_URL,
            type: "RsaVerificationKey2018",
            id: "RsaVerification2018",
            controller: "RsaController2018",
            publicKeyPem
        };
        const key = new RSAKeyPair({...publicKey, privateKeyPem});
        var signConfig = {
          // documentLoader: jsonld.documentLoader,
          suite: new RsaSignature2018({key}),
          purpose: new AssertionProofPurpose()
        };
        const signed = await jsigs.sign(doc, signConfig);
        console.log('Signed document:', signed);
        console.log('Signed document stringified:', JSON.stringify(signed));
        return signed;
    },

    // Verify document
    verifyDocument: async function(signedUri, /*verifyConfig*/) {
        // Specifying verification configuration
        // TODO - allow specification of publicKey["@id"], publicKey.owner, and publicKeyOwner["@id"] in verifyConfig
        // Specify the public key owner object
        /*var publicKey = {
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
        });*/
        const {RsaSignature2018} = jsigs.suites;
        const {AssertionProofPurpose} = jsigs.purposes;
        const {RSAKeyPair} = jsigs;
        const publicKeyStr = await SolidUtil.getPubKeyRemoteContent(/*TODO: after uploading jsigs-signed document inspect it to determine how to load this value*/);
        const publicKey = JSON.parse(publicKeyStr);
        const privateKeyPem = null; // You do not know the private key of the signer
        const key = new RSAKeyPair({...publicKey, privateKeyPem});
        const controllerUri = publicKey[SolidUtil.secControllerField];
        const controllerStr = await SolidUtil.genericFetchJson(controllerUri);
        const controller = JSON.parse(controllerStr);
        const signedStr = await SolidUtil.genericFetchJson(signedUri);
        const signed = JSON.parse(signedStr);
        const result = await jsigs.verify(signed, {
          // documentLoader: jsonld.documentLoader,
          suite: new RsaSignature2018({key}),
          purpose: new AssertionProofPurpose({controller})
        });
        if (result.verified) {
          console.log('Signature verified.');
        } else {
          console.log('Signature verification error:', result.error);
        }
    }
    //// END APP ////
};

// $(window).on('load', SolidUtil.init);
module.exports = SolidUtil;
