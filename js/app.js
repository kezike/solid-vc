'use strict';

var n3 = require('n3');
// var $rdf = require('rdflib');
var auth = require('solid-auth-client');
var forge = require('node-forge');
var ed25519 = forge.pki.ed25519;
var rsa = forge.pki.rsa;

var OIDCWebClient = OIDC.OIDCWebClient;
var options = {solid:true};
var oidc = new OIDCWebClient(options);

// var webID = 'https://kezike.databox.me/profile/card#me';
// var webID = 'https://kezike_test.solidtest.space/profile/card#me';
// var myWebID = 'https://kayodeyezike.com/profile/card#me';
var provider = 'https://kezike17.solidtest.space/';
// var provider = 'https://kezike17.solid.community/';
var publicRepo = provider + 'public/';
var svcRepo = publicRepo + 'svc/';
var credentialRepo = svcRepo + 'credentials/';
// var credentialGraph = $rdf.graph(credentialRepo);
var metaFile = svcRepo + 'meta.n3';
var myWebID = 'https://kezike17.solidtest.space/profile/card#me';
var timWebID = 'https://www.w3.org/People/Berners-Lee/card#i';
var homeURI = 'http://localhost:8080/';
var popupURI = homeURI + 'popup.html';

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
var SolidVC = SolidVC || {};

SolidVC = {
    namespaces: {
      SVC_EDU: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-edu#'),
      SVC_FIN: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-fin#'),
      SVC_GEN: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-gen#'),
      SVC_GOV: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-gov#'),
      SVC_HEALTH: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-health#'),
      SVC_LAW: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-law#'),
      SVC_MED: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-med#'),
      SVC_OCC: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-occ#'),
      SVC_TRANS: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-trans#'),
      SVC_TRAVEL: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-travel#')
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

    statements: [],

    serializedCredential: "",

    signedCredential: {},

    signature: "",

    creator: "",

    privateKey: {},

    publicKey: {},

    session: {},

    fetch: auth.fetch,

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

    updateManager: null,

    // Initialize app
    init: function() {
        SolidVC.generateKeyPair({keyType: 'RSA', bits: 2048, workers: 2});
        SolidVC.bindEvents();
        SolidVC.addPrefixes();
        SolidVC.displayStatements();
        /*svcSession = window.session;
        svcFetch = window.fetch;
        SolidVC.fetcher = $rdf.fetcher($rdf.graph(), {fetch: svcFetch});
        console.log("svcSession:\n", svcSession);
        console.log("SolidVC.fetcher._fetch:\n", SolidVC.fetcher._fetch);*/
        console.log('auth.fetch:', auth.fetch);
        SolidVC.login();
    },

    addPrefixes: function() {
        var prefixes = SolidVC.prefixesN3;
        for (var i = 0; i < SolidVC.prefixesN3.length; i++) {
          var prefix = prefixes[i];
          SolidVC.credentialN3 += prefix + "\n";
        }
    },

    // Load user profile
    loadProfile: function (webId) {
        SolidVC.fetcher.nowOrWhenFetched(webId, function(ok, body, xhr) {
            if (!ok) {
              console.log("Oops, something happened and couldn't fetch data");
            } else {
              try {
                var me = $rdf.sym(webId);
                var name = FOAF('name');
                var myNameObj = SolidVC.fetcher.store.any(me, name);
                var myName = myNameObj.value;
                /*var img = FOAF('img');
                var myImgObj = SolidVC.fetcher.store.any(me, img);
                var myImg = myImgObj.value;*/
                var knows = FOAF('knows');
                var myFriends = SolidVC.fetcher.store.each(me, knows);
                console.log('My name:', myName);
                // console.log('My image:', myImg);
                console.log('My friends:');
                for (var i = 0; i < myFriends.length; i++) {
                  var friend = myFriends[i];
                  console.log(friend.value);
                }
                document.getElementById('name').textContent = myName;
                // document.getElementById('image').setAttribute('src', myImg);
                document.getElementById('profile').classList.remove('hidden');
              } catch (err) {
                console.log(err);
              }
            }
        });
    },

    // Login to app
    login: function() {
        auth.currentSession().then((currentSession) => {
            if (!currentSession) {
              auth.popupLogin({popupUri: popupURI}).then((popupSession) => {
                  SolidVC.session = popupSession;
                  console.log('popupSession:', SolidVC.session);
                  SolidVC.fetcher = $rdf.fetcher($rdf.graph());
                  SolidVC.updateManager = new $rdf.UpdateManager(SolidVC.fetcher.store);
                  console.log("SolidVC.fetcher:", SolidVC.fetcher);
                  console.log("SolidVC.fetcher._fetch:", SolidVC.fetcher._fetch);
                  // SolidVC.loadProfile(popupSession.webId);
              }).catch((err) => {
                 console.error(err.name + ": " + err.message);
              });
              return;
            }
            SolidVC.session = currentSession;
            console.log('currentSession:', SolidVC.session);
            SolidVC.fetcher = $rdf.fetcher($rdf.graph());
            SolidVC.updateManager = new $rdf.UpdateManager(SolidVC.fetcher.store);
            console.log("SolidVC.fetcher:", SolidVC.fetcher);
            console.log("SolidVC.fetcher._fetch:", SolidVC.fetcher._fetch);
            // SolidVC.loadProfile(popupSession.webId);
        }).catch((err) => {
           console.error(err.name + ": " + err.message);
        });
    },

    // Bind events
    bindEvents: function() {
        // $(document).on('click', '#add-stmt', SolidVC.addStatement);
        // $(document).on('click', '.remove-stmt', SolidVC.removeStatement);
        // $(document).on('change', '#signature', SolidVC.handleSignatureUpload);
        // $(document).on('change', '#creator', SolidVC.handleCreatorUpload);
        $(document).on('click', '#issue-cred', SolidVC.issueCredential);
        $(document).on('click', '#patch-meta', SolidVC.patchMetaFile);
    },

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
            SolidVC.credential = JSON.parse(reader.result);
            console.log("Credential:", SolidVC.credential);
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
            SolidVC.signature = reader.result;
            console.log("Signature:", SolidVC.signature);
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
            SolidVC.creator = reader.result;
            console.log("Creator:", SolidVC.creator);
        };

        // Read in the image file as a data URL.
        reader.readAsText(file);
    },

    /*createCredential: function (event) {
        // TODO: pick out inputs of credential form and populate credential with it
        event.preventDefault();
        var credential = {};
        credential = SolidVC.credential;
        credential["signature"] = {};
        credential["signature"]["@context"] = SolidVC.DefaultContext;
        credential["signature"]["@type"] = SolidVC.DefaultSigType;
        credential["signature"]["creator"] = SolidVC.creator;
        credential["signature"]["signatureValue"] = SolidVC.signature; // TODO: Load from browser
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
    serializeCredential: function(credential, options=SolidVC.DefaultCredentialSerializerOptions, credentialSerializer=SolidVC.serializeCredentialDefault) {
        return credentialSerializer(credential, options);
    },

    // Default credential serializer
    serializeCredentialDefault: function(credential, options) {
        var serializedCredential = SolidVC.DefaultCredentialSerializerOptions.startToken;
        var claims = credential[options.claimKey];
        var numClaims = Object.keys(claims).length;
        var i = 0;
        for (var claimAttr in claims) {
          serializedCredential += claimAttr + SolidVC.DefaultCredentialSerializerOptions.defToken + claims[claimAttr];
          if (i == numClaims - 1) {
            break;
          }
          serializedCredential += SolidVC.DefaultCredentialSerializerOptions.sepToken;
          i++;
        }
        serializedCredential += SolidVC.DefaultCredentialSerializerOptions.endToken;
        return serializedCredential;
    },

    // Generate (privKey, pubKey) pair
    generateKeyPair: function(options) {
        switch (options.keyType) {
          case 'RSA':
            rsa.generateKeyPair({bits: options.bits, workers: options.workers}, (err, keypair) => {
                SolidVC.privateKey['RSA'] = keypair.privateKey;
                SolidVC.publicKey['RSA'] = keypair.publicKey;
            });
          default:
            rsa.generateKeyPair({bits: options.bits, workers: options.workers}, (err, keypair) => {
                SolidVC.privateKey['RSA'] = keypair.privateKey;
                SolidVC.publicKey['RSA'] = keypair.publicKey;
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
    signCredentialJsonLD: function(credential, options=SolidVC.DefaultCredentialSignerOptions, credentialSigner=SolidVC.signCredentialDefaultJsonLD) {
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
        var signature = SolidVC.privateKey[options.keyType].sign(md);
        credential["signature"] = {};
        credential["signature"]["@context"] = SolidVC.DefaultContext;
        credential["signature"]["@type"] = SolidVC.DefaultSigType;
        credential["signature"]["creator"] = SolidVC.creator;
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
    signCredentialN3: function(credential, options={}, credentialSigner=SolidVC.signCredentialDefaultN3) {
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
        signature = SolidVC.privateKey[options.keyType].sign(md);
        credential.add(proof, SEC('signatureValue'), $rdf.Literal.fromValue(signature));
        credential.add(txn, SVC('proof'), $rdf.Literal.fromValue(proof));
        return credential;
    },

    addStatement: function(event) {
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
        SolidVC.statements.push(stmt);
        $('#subject').val("");
        $('#predicate').val("");
        $('#object').val("");
        SolidVC.displayStatements();
    },

    removeStatement: function(event) {
        console.log("event.target:", event.target);
        console.log("event.target.id:", event.target.id);
        var cancelIdSplit = event.target.id.split("-");
        var stmtIdx = parseInt(cancelIdSplit[1]);
        SolidVC.statements.splice(stmtIdx, 1);
        SolidVC.displayStatements();
    },

    displayStatements: function() {
        var stmts = SolidVC.statements;
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
    },

    // Serialize and sign credential prior to issuance
    issueCredential: function(event) {
        /*SolidVC.serializedCredential = SolidVC.serializeCredential(SolidVC.credential);
        SolidVC.DefaultCredentialSignerOptions.serializedCredential = SolidVC.serializedCredential;
        SolidVC.signedCredential = SolidVC.signCredential(SolidVC.credential);
        console.log("signed credential:", SolidVC.signedCredential);
        return SolidVC.signedCredential;*/
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
        /*SolidVC.credentialN3 += ":txn a svc:Transaction .\n";
        SolidVC.credentialN3 += ":txn svc:id 10 .\n";
        credPlain = "\"\"\"" + credPlain + "\"\"\"@en";
        SolidVC.credentialN3 += ":txn svc:credPlain " + credPlain + " .\n";
        SolidVC.credentialN3 += ":txn svc:credContext " + credContext + ":ticker .\n";
        // SolidVC.credentialN3 += ":txn svc:credSerialization \"" + credSerialization + "\" .\n";
        SolidVC.credentialN3 += ":txn svc:prev " + ":txn" + " .\n";
        SolidVC.credentialN3 += ":txn svc:prevHash " + ":txn" + " .\n";
        SolidVC.credentialN3 += ":txn svc:issuer <" + myWebID + "> .\n";
        SolidVC.credentialN3 += ":txn svc:subject <" + myWebID + "> .\n";
        SolidVC.credentialN3 += ":txn svc:signature <" + myWebID + "-signs-cred> .\n";
        SolidVC.credentialN3 += ":txn svc:timestamp \"" + (new Date()).toISOString() + "\" .\n";
        // console.log("SolidVC.credentialN3:\n", SolidVC.credentialN3);*/

        var getOptions = {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
          clearPreviousData: true
        };

        var postOptions = {
          method: 'POST',
          headers: {
            'content-type': 'text/n3',
            'slug': 'Properly populated in POST request below'
          },
          mode: 'cors',
          credentials: 'include',
          body: 'Properly populated in POST request below'
        };

        SolidVC.fetcher.load(metaFile, getOptions).then((resGetMeta) => {
            var currTxnIdxStr = SolidVC.fetcher.store.match(undefined, SVC('length'), undefined)[0].object.value;
            var currTxnSlugStr = 'credential-' + currTxnIdxStr;
            var prevTxnIdxStr = currTxnIdxStr - 1;
            var prevTxnStr = 'credential-' + prevTxnIdxStr;
            var prevTxnId = SolidVC.fetcher.store.match(undefined, SVC('id'), undefined)[0].object.value;
            var prevHash = 'Properly populated in GET request below';
            SolidVC.fetcher.load(prevTxnId, getOptions).then((resGetPrev) => {
                THIS = $rdf.Namespace(credentialRepo + currTxnSlugStr + '.n3#');
                var credStore = $rdf.graph();
                var credPlainStore = $rdf.graph();
                var me = $rdf.sym(myWebID);
                var base = me.value;
                var type = 'text/n3';
                var md = forge.md.sha256.create();
                md.update(SolidVC.fetcher.store.toCanonical(), 'utf8');
                prevHash = md.digest().data;
                $rdf.parse(credPlain, credPlainStore, base, type, (errParse, resParse) => {
                    if (errParse) {
                      // console.error(errParse.name + ": " + errParse.message);
                      console.log("errParse:\n", errParse);
                      return;
                    }
                    var txn = $rdf.sym(THIS('txn'));
                    credStore.add(THIS('txn'), RDF('type'), SVC('Transaction'));
                    credStore.add(THIS('txn'), SVC('id'), THIS('txn'));
                    credStore.add(THIS('txn'), SVC('credPlain'), resParse);
                    credStore.add(THIS('txn'), SVC('credContext'), SolidVC.namespaces[$rdf.Literal.fromValue(credContext)]('ticker'));
                    credStore.add(THIS('txn'), SVC('prev'), $rdf.sym(prevTxnId));
                    credStore.add(THIS('txn'), SVC('prevHash'), $rdf.Literal.fromValue(prevHash));
                    SolidVC.signCredentialN3(credStore, {type: 'RsaSignature2018', creator: myWebID, keyType: 'RSA'});
                    $rdf.serialize(null, credStore, base, type, (errSer, resSer) => {
                        if (errSer) {
                          var errMsg = errSer.name + ": " + errSer.message;
                          alert(errMsg);
                          console.error(errMsg);
                          return;
                        }
                        // console.log("resSer:\n", resSer);
                        SolidVC.credentialN3 = resSer;
                    }, {});
                });
                postOptions.headers.slug = currTxnSlugStr;
                postOptions.body = SolidVC.credentialN3;
                SolidVC.fetcher.load(credentialRepo, postOptions).then((resPostCred) => {
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
        SolidVC.statements = [];*/
        $('#credPlain').val("");
        $('#credContext').val("");
        // $('#credSerialization').val("");
    },

    patchMetaFile: function(event) {
        event.preventDefault();
        var insertions = $rdf.graph();
        insertions.add(META('ledger'), SVC('locked'), $rdf.Literal.fromValue(1));
        var deletions = $rdf.graph();
        deletions.add(META('ledger'), SVC('locked'), $rdf.Literal.fromValue(0));
        /*var patchOptions = {
          insert: insertions,
          delete: deletions
        };
        SolidVC.fetcher.store.applyPatch(patchOptions, metaFile, () => {});*/
        SolidVC.updateManager.update(insertions, deletions, (uri, success, errorbody) => {});
    },

    // Verify credential has proper signature
    verifyCredential: function(credential, pubKey, sig) {
    }
};

$(window).on('load', function() {
    SolidVC.init();
});
