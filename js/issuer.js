// 'use strict';
// Solid Verifiable Credentials Issuer

// Libraries and dependencies
var $n3 = require('n3');
var $rdf = require('rdflib');
// var $auth = require('solid-auth-client');
var forge = require('node-forge');
var ed25519 = forge.pki.ed25519;
var rsa = forge.pki.rsa;

// Global variables
var provider = 'https://kezike.solid.community/';
// var provider = 'https://kezike17.solid.community/';
// var provider = 'https://kezike17.solidtest.space/';
// var provider = 'https://kezike.solidtest.space/';
var publicRepo = provider + 'public/';
var svcRepo = publicRepo + 'svc/';
var credentialRepo = publicRepo + 'credentials/';
var metaFile = svcRepo + 'meta-gen.n3';
var myWebId = provider + 'profile/card#me';
// var myWebId = 'https://kayodeyezike.com/profile/card#me';
// var myWebId = 'https://kezike17.solidtest.space/profile/card#me';
// var myWebId = 'https://kezike.solidtest.space/profile/card#me';
var timWebId = 'https://www.w3.org/People/Berners-Lee/card#i';
var homeURI = 'http://localhost:8080/';
var popupURI = homeURI + 'popup.html';

// RDF Namespaces
var THIS = $rdf.Namespace('#');
var META = $rdf.Namespace(metaFile + '#');
var FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
var RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
var RDFS = $rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');
var WS = $rdf.Namespace('https://www.w3.org/ns/pim/space#');
var SEC = $rdf.Namespace('https://w3id.org/security#');
var SVC = $rdf.Namespace('http://dig.csail.mit.edu/2018/svc#');

var svcSession;
var svcFetch;
var SolidIss = SolidIss || {};

SolidIss = {
    activeTab: '', // {#review, #issue}

    reviewTab: '#review-tab',

    issueTab: '#issue-tab',

    // Initialize app
    init: function(event) {
        // SolidSub.generateKeyPair({keyType: 'RSA', bits: 2048, workers: 2});
        SolidIss.bindEvents();
        SolidIss.activeTab = SolidIss.reviewTab;
        $('#active-tab').load(SolidIss.activeTab);
    },

    // Bind events
    bindEvents: function() {
        $(document).on('click', '#review-reqs', SolidIss.loadReview);
        $(document).on('click', '#issue-cred', SolidIss.loadIssue);
    },

    loadReview: function(event) {
        $(SolidIss.activeTab).hide();
        SolidIss.activeTab = SolidIss.reviewTab;
        $('#active-tab').load(SolidIss.activeTab);
    },

    loadIssue: function(event) {
        $(SolidIss.activeTab).hide();
        SolidIss.activeTab = SolidIss.issueTab;
        $('#active-tab').load(SolidIss.activeTab);
    },

    namespaces: {
        svcEdu: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-edu#'),
        svcFin: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-fin#'),
        svcGen: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-gen#'),
        svcGov: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-gov#'),
        svcHealth: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-health#'),
        svcLaw: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-law#'),
        svcMed: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-med#'),
        svcOcc: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-occ#'),
        svcTrans: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-trans#'),
        svcTravel: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-travel#')
    },

    credential: {},

    credentialN3: "",

    prefixesN3: [
                  "@prefix owl: <http://www.w3.org/2002/07/owl#> .",
                  "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .",
                  "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .",
                  "@prefix dcterms: <http://dublincore.org/2012/06/14/dcterms#> .",
                  "@prefix dcelements: <http://dublincore.org/2012/06/14/dcelements#> .",
                  "@prefix svc: <http://dig.csail.mit.edu/2018/svc#> .",
                  "@prefix svcEdu: <http://dig.csail.mit.edu/2018/svc-edu#> .",
                  "@prefix svcFin: <http://dig.csail.mit.edu/2018/svc-fin#> .",
                  "@prefix svcGen: <http://dig.csail.mit.edu/2018/svc-gen#> .",
                  "@prefix svcGov: <http://dig.csail.mit.edu/2018/svc-gov#> .",
                  "@prefix svcHealth: <http://dig.csail.mit.edu/2018/svc-health#> .",
                  "@prefix svcLaw: <http://dig.csail.mit.edu/2018/svc-law#> .",
                  "@prefix svcMed: <http://dig.csail.mit.edu/2018/svc-med#> .",
                  "@prefix svcOcc: <http://dig.csail.mit.edu/2018/svc-occ#> .",
                  "@prefix svcTrans: <http://dig.csail.mit.edu/2018/svc-trans#> .",
                  "@prefix svcTravel: <http://dig.csail.mit.edu/2018/svc-travel#> ."
    ],

    // statements: [],

    serializedCredential: "",

    signedCredential: {},

    signature: "",

    creator: "",

    privateKey: {},

    publicKey: {},

    session: {},

    // fetch: $auth.fetch,

    accessToken: "",

    DefaultCredentialSerializerOptions: {
      claimKey: "claim",
      startToken: "{",
      endToken: "}",
      defToken: "->",
      sepToken: ";"
    },

    DefaultCredentialSignerOptions: {
      serializedCredential: ""
    },

    DefaultContext: {
      "foaf": "http://xmlns.com/foaf/0.1/",
      "perJsonld": "http://json-ld.org/contexts/person.jsonld",
      "sec": "https://w3id.org/security/v1"
    },

    DefaultSigType: 'RsaSignature2018',

    fetcher: null,

    updater: null,

    role: "",

    webPage: "",

    // Handle credential upload
    handleCredentialUpload: function(event) {
        console.log("MEEP");
        var files = event.target.files; // FileList object

        // use the 1st file from the list
        var file = files[0];
        console.log(file);

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = function(e) {
            SolidIss.credential = JSON.parse(reader.result);
            console.log("Credential:", SolidIss.credential);
        };

        // Read in the image file as a data URL.
        reader.readAsText(file);
    },

    // Handle signature upload
    handleSignatureUpload: function(event) {
        var files = event.target.files; // FileList object

        // use the 1st file from the list
        var file = files[0];

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = function(e) {
            SolidIss.signature = reader.result;
            console.log("Signature:", SolidIss.signature);
        };

        // Read in the image file as a data URL.
        reader.readAsText(file);
    },

    // Handle creator upload
    handleCreatorUpload: function(event) {
        var files = event.target.files; // FileList object

        // use the 1st file from the list
        var file = files[0];

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = function(e) {
            SolidIss.creator = reader.result;
            console.log("Creator:", SolidIss.creator);
        };

        // Read in the image file as a data URL.
        reader.readAsText(file);
    },

    /*createCredential: function (event) {
        // TODO: pick out inputs of credential form and populate credential with it
        event.preventDefault();
        var credential = {};
        credential = SolidIss.credential;
        credential["signature"] = {};
        credential["signature"]["@context"] = SolidIss.DefaultContext;
        credential["signature"]["@type"] = SolidIss.DefaultSigType;
        credential["signature"]["creator"] = SolidIss.creator;
        credential["signature"]["signatureValue"] = SolidIss.signature; // TODO: Load from browser
        console.log("credential:", credential);
        return credential;
    },*/

    // Serialize credential for purposes of verifying at a later point in time
    // - 'credential' is a credential in json
    // - 'options' is a set of parameters also in
    //   json describing how to encode the credential
    // - 'credentialSerializer' selects the function for serializing a credential
    //   This function must accept a credential in json and a set of options
    //   for parametrizing the credential serialization
    serializeCredential: function(credential, options=SolidIss.DefaultCredentialSerializerOptions, credentialSerializer=SolidIss.serializeCredentialDefault) {
        return credentialSerializer(credential, options);
    },

    // Default credential serializer
    serializeCredentialDefault: function(credential, options) {
        var serializedCredential = SolidIss.DefaultCredentialSerializerOptions.startToken;
        var claims = credential[options.claimKey];
        var numClaims = Object.keys(claims).length;
        var i = 0;
        for (var claimAttr in claims) {
          serializedCredential += claimAttr + SolidIss.DefaultCredentialSerializerOptions.defToken + claims[claimAttr];
          if (i == numClaims - 1) {
            break;
          }
          serializedCredential += SolidIss.DefaultCredentialSerializerOptions.sepToken;
          i++;
        }
        serializedCredential += SolidIss.DefaultCredentialSerializerOptions.endToken;
        return serializedCredential;
    },

    // Generate (privKey, pubKey) pair
    generateKeyPair: function(options) {
        switch (options.keyType) {
          case 'RSA':
            rsa.generateKeyPair({bits: options.bits, workers: options.workers}, (err, keypair) => {
                SolidIss.privateKey['RSA'] = keypair.privateKey;
                SolidIss.publicKey['RSA'] = keypair.publicKey;
            });
          default:
            rsa.generateKeyPair({bits: options.bits, workers: options.workers}, (err, keypair) => {
                SolidIss.privateKey['RSA'] = keypair.privateKey;
                SolidIss.publicKey['RSA'] = keypair.publicKey;
            });
        }
    },

    /** Produce JSON-LD signature for credential
     *
     * @param credential {Object} Credential object
     * @param options {Object} Optional configuration for signature
     * @param credentialSigner {Object} Function for signing credential
     *
     * @returns {Object} Signed JSON-LD credential
     */
    signCredentialJsonLD: function(credential, options=SolidIss.DefaultCredentialSignerOptions, credentialSigner=SolidIss.signCredentialDefaultJsonLD) {
        return credentialSigner(credential, options);
    },

    /** Produce JSON-LD signature for credential
     *
     * @param credential {Object} Credential object
     * @param options {Object} Optional configuration for signature
     *
     * @returns {Object} Signed JSON-LD credential
     */
    signCredentialDefaultJsonLD: function(credential, options) {
        var md = forge.md.sha256.create();
        md.update(options.serializedCredential, 'utf8');
        var signature = SolidIss.privateKey[options.keyType].sign(md);
        credential["signature"] = {};
        credential["signature"]["@context"] = SolidIss.DefaultContext;
        credential["signature"]["@type"] = SolidIss.DefaultSigType;
        credential["signature"]["creator"] = SolidIss.creator;
        credential["signature"]["signatureValue"] = signature;
        return credential;
    },

    /** Produce N3 signature for credential
     *
     * @param credential {IndexedFormula} Credential triple store
     * @param options {Object} Optional configuration for signature
     * @param credentialSigner {Object} Function for signing credential
     *
     * @returns {IndexedFormula} Signed N3 credential
     */
    signCredentialN3: function(credential, options={}, credentialSigner=SolidIss.signCredentialDefaultN3) {
        return credentialSigner(credential, options);
    },

    /** Produce N3 signature for credential
     *
     * @param credential {IndexedFormula} Credential triple store
     * @param options {Object} Optional configuration for signature
     *
     * @returns {IndexedFormula} Signed N3 credential
     */
    signCredentialDefaultN3: function(credential, options) {
        var signature;
        var txn = $rdf.sym(THIS('txn'));
        var md = forge.md.sha256.create();
        var proof = $rdf.sym(THIS('proof'));
        if (!options.type || !options.creator || !options.keyType) {
          // TODO: At the moment this is not needed because it is enforced elsewhere
          // This may become necessary in future iterations when users select parameters
        }
        credential.add(proof, RDF('type'), SEC($rdf.Literal.fromValue(options.type)));
        credential.add(proof, SEC('created'), $rdf.Literal.fromValue(new Date()));
        credential.add(proof, SEC('creator'), $rdf.Literal.fromValue(options.creator));
        // credential.add(proof, SEC("nonce"), options.nonce);
        md.update(credential.toCanonical(), 'utf8');
        signature = SolidIss.privateKey[options.keyType].sign(md);
        credential.add(proof, SEC('signatureValue'), $rdf.Literal.fromValue(signature));
        credential.add(txn, SVC('proof'), $rdf.Literal.fromValue(proof));
        return credential;
    },

    /*addStatement: function(event) {
        event.preventDefault();
        var sub = $rdf.sym($('#subject').val());
        var pred = FOAF($('#predicate').val());
        var obj = $rdf.sym($('#object').val());
        if (sub === "") {
          alert("Please include a subject");
          return;
        }
        if (pred === "") {
          alert("Please include a predicate");
          return;
        }
        if (obj === "") {
          alert("Please include a object");
          return;
        }
        var stmt = {"sub": sub, "pred": pred, "obj": obj};
        SolidIss.statements.push(stmt);
        $('#subject').val("");
        $('#predicate').val("");
        $('#object').val("");
        SolidIss.displayStatements();
    },

    removeStatement: function(event) {
        console.log("event.target:", event.target);
        console.log("event.target.id:", event.target.id);
        var cancelIdSplit = event.target.id.split("-");
        var stmtIdx = parseInt(cancelIdSplit[1]);
        SolidIss.statements.splice(stmtIdx, 1);
        SolidIss.displayStatements();
    },

    displayStatements: function() {
        var stmts = SolidIss.statements;
        var stmtsDiv = $('#stmts');
        stmtsDiv.empty();
        for (var i = 0; i < stmts.length; i++) {
          var stmt = stmts[i];
          stmtsDiv.append("<div>");
          stmtsDiv.append("<u>Statement " + (i + 1).toString() + "</u>: ");
          stmtsDiv.append("subject: ");
          stmtsDiv.append(stmt.sub.value);
          stmtsDiv.append("; predicate: ");
          stmtsDiv.append(stmt.pred.value);
          stmtsDiv.append("; object: ");
          stmtsDiv.append(stmt.obj.value);
          var cancelImg = $("<img src='../img/cancel.png'>");
          cancelImg.attr('id', 'cancel-' + i.toString());
          cancelImg.attr('class', 'remove-stmt');
          stmtsDiv.append(cancelImg);
          stmtsDiv.append("</div>");
        }
    },*/

    // Serialize and sign credential prior to issuance
    issueCredential: function(event) {
        /*SolidIss.serializedCredential = SolidIss.serializeCredential(SolidIss.credential);
        SolidIss.DefaultCredentialSignerOptions.serializedCredential = SolidIss.serializedCredential;
        SolidIss.signedCredential = SolidIss.signCredential(SolidIss.credential);
        console.log("signed credential:", SolidIss.signedCredential);
        return SolidIss.signedCredential;*/
        event.preventDefault();
        var credPlain = $('#credPlain').val();
        var credContext = $('#credContext').val();
        // var credSerialization = $('#credSerialization').val();
        if (credPlain === "") {
          alert("Please include a credential in the text area");
          $('#credPlain').focus();
          return;
        }
        if (credContext === "") {
          alert("Please select a valid context for the credential");
          $('#credContext').focus();
          return;
        }
        /*if (credSerialization === "") {
          alert("Please select a valid serialization for the credential");
          $("#credSerialization").focus();
          return;
        }*/
        /*SolidIss.credentialN3 += ":txn a svc:Transaction .\n";
        SolidIss.credentialN3 += ":txn svc:id 10 .\n";
        credPlain = "\"\"\"" + credPlain + "\"\"\"@en";
        SolidIss.credentialN3 += ":txn svc:credPlain " + credPlain + " .\n";
        SolidIss.credentialN3 += ":txn svc:credContext " + credContext + ":ticker .\n";
        // SolidIss.credentialN3 += ":txn svc:credSerialization \"" + credSerialization + "\" .\n";
        SolidIss.credentialN3 += ":txn svc:prev " + ":txn" + " .\n";
        SolidIss.credentialN3 += ":txn svc:prevHash " + ":txn" + " .\n";
        SolidIss.credentialN3 += ":txn svc:issuer <" + myWebId + "> .\n";
        SolidIss.credentialN3 += ":txn svc:subject <" + myWebId + "> .\n";
        SolidIss.credentialN3 += ":txn svc:signature <" + myWebId + "-signs-cred> .\n";
        SolidIss.credentialN3 += ":txn svc:timestamp \"" + (new Date()).toISOString() + "\" .\n";
        // console.log("SolidIss.credentialN3:\n", SolidIss.credentialN3);*/

        var getOptions = {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
          clearPreviousData: true
        };

        var postOptions = {
          method: 'POST',
          headers: {
            'content-type': 'text/n3'/*,
            'slug': 'Properly populated in POST request below'*/
          },
          mode: 'cors',
          credentials: 'include',
          body: 'Properly populated in POST request below'
        };

        SolidIss.fetcher.load(metaFile, getOptions).then((resGetMeta) => {
            var currTxnId = SolidIss.fetcher.store.match(undefined, SVC('length'), undefined)[0].object.value;
            // var currTxnSlugStr = 'credential-' + currTxnId;
            var prevTxn = SolidIss.fetcher.store.match(undefined, SVC('head'), undefined)[0].object.value;
            // var prevTxnIdxStr = currTxnId - 1;
            // var prevTxnStr = 'credential-' + prevTxnIdxStr;
            // var prevTxnId = SolidIss.fetcher.store.match(undefined, SVC('id'), undefined)[0].object.value;
            var prevHash = 'Properly populated in GET request below';
            SolidIss.fetcher.load(prevTxn, getOptions).then((resGetPrev) => {
                // THIS = $rdf.Namespace(credentialRepo + currTxnSlugStr + '.n3#');
                THIS = $rdf.Namespace(prevTxn + '#');
                var credStore = $rdf.graph();
                var credPlainStore = $rdf.graph();
                var me = $rdf.sym(myWebId);
                var base = me.value;
                var type = 'text/n3';
                var md = forge.md.sha256.create();
                md.update(SolidIss.fetcher.store.toCanonical(), 'utf8');
                prevHash = md.digest().data;
                $rdf.parse(credPlain, credPlainStore, base, type, (errParse, resParse) => {
                    if (errParse) {
                      // console.error(errParse.name + ": " + errParse.message);
                      console.log("errParse:\n", errParse);
                      return;
                    }
                    var txn = $rdf.sym(THIS('txn'));
                    credStore.add(THIS('txn'), RDF('type'), SVC('Transaction'));
                    credStore.add(THIS('txn'), SVC('id'), $rdf.Literal.fromValue(currTxnId));
                    credStore.add(THIS('txn'), SVC('credPlain'), resParse);
                    credStore.add(THIS('txn'), SVC('credContext'), SolidIss.namespaces[credContext]('ticker'));
                    credStore.add(THIS('txn'), SVC('prev'), $rdf.sym(prevTxn));
                    credStore.add(THIS('txn'), SVC('prevHash'), $rdf.Literal.fromValue(prevHash));
                    SolidIss.signCredentialN3(credStore, {type: 'RsaSignature2018', creator: myWebId, keyType: 'RSA'});
                    $rdf.serialize(null, credStore, base, type, (errSer, resSer) => {
                        if (errSer) {
                          var errMsg = errSer.name + ": " + errSer.message;
                          alert(errMsg);
                          console.error(errMsg);
                          return;
                        }
                        // console.log("resSer:\n", resSer);
                        SolidIss.credentialN3 = resSer;
                    }, {});
                });
                // postOptions.headers.slug = currTxnSlugStr;
                postOptions.body = SolidIss.credentialN3;
                SolidIss.fetcher.load(credentialRepo, postOptions).then((resPostCred) => {
                    console.log(resPostCred);
                }).catch((err) => {
                   console.error(err.name + ": " + err.message);
                });
            }).catch((err) => {
               console.error(err.name + ": " + err.message);
            });
        }).catch((err) => {
           console.error(err.name + ": " + err.message);
        });
        /*$('#subject').val("");
        $('#predicate').val("");
        $('#object').val("");
        SolidIss.statements = [];*/
        $('#credPlain').val("");
        $('#credContext').val("");
        // $('#credSerialization').val("");
    },

    patchMetaFile: function(event) {
        event.preventDefault();
        META = $rdf.Namespace('https://kezike.solid.community/public/svc/meta-gen.n3#');
        /*SolidIss.fetcher.load(metaFile, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include'
        }).then((response) => {
            var deletions = SolidIss.fetcher.store.match(META('ledger'), SVC('locked'), $rdf.Literal.fromValue(1));
            console.log('deletions:', deletions);
            var insertions = $rdf.st(META('ledger'), SVC('locked'), $rdf.Literal.fromValue(0), $rdf.sym(metaFile));
            SolidIss.updater.update(deletions, insertions, (uri, success, error) => {
                console.log('uri:', uri);
                console.log('success:', success);
                console.log('error:', error);
            });
        });*/
        var deletions = SolidIss.fetcher.store.match(META('ledger'), SVC('locked'), $rdf.Literal.fromValue(0));
        var insertions = $rdf.st(META('ledger'), SVC('locked'), $rdf.Literal.fromValue(1), $rdf.sym('https://kezike.solid.community/public/svc/meta-gen.n3'));
        SolidIss.updater.update(deletions, insertions, (uri, success, error) => {
            console.log('uri:', uri);
            console.log('success:', success);
            console.log('error:', error);
        }, true);
    },

    // Verify credential has proper signature
    verifyCredential: function(credential, pubKey, sig) {
    }
};

$(window).on('load', SolidIss.init);
module.exports = SolidIss;
