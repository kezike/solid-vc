'use strict';

var n3 = require('n3');
var $rdf = require('rdflib');
var auth = require('solid-auth-client');
var forge = require('node-forge');
var ed25519 = forge.pki.ed25519;
var rsa = forge.pki.rsa;

var OIDCWebClient = OIDC.OIDCWebClient;
var options = {solid:true};
var oidc = new OIDCWebClient(options);

var FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');

// var webID = 'https://kezike.databox.me/profile/card#me';
// var webID = 'https://kezike_test.solidtest.space/profile/card#me';
// var myWebID = 'https://kayodeyezike.com/profile/card#me';
var provider = 'https://kezike17.solidtest.space/';
var publicRepo = provider + 'public/';
var credentialRepo = publicRepo + 'credentials/';
var credentialGraph = $rdf.graph(credentialRepo);
var myWebID = 'https://kezike17.solidtest.space/profile/card#me';
var timWebID = 'https://www.w3.org/People/Berners-Lee/card#i';
var homeURI = 'http://localhost:8080/';
var popupURI = homeURI + 'popup.html';

/*var store = $rdf.graph();
var timeout = 5000; // 5000 ms timeout
var fetcher = new $rdf.Fetcher(store, timeout);*/

var svcSession;
var svcFetch;

var SolidVC = SolidVC || {};

SolidVC = {
    
    credential: {},

    credentialN3: "",

    prefixesN3: [
                  "@prefix owl: <http://www.w3.org/2002/07/owl#> .",
                  "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .",
                  "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .",
                  "@prefix dcterms: <http://dublincore.org/2012/06/14/dcterms#> .",
                  "@prefix dcelements: <http://dublincore.org/2012/06/14/dcelements#> .",
                  "@prefix svc: <http://dig.csail.mit.edu/2018/svc#> ."
    ],

    statements: [],

    serializedCredential: "",

    signedCredential: {},

    signature: "",

    creator: "",

    privateKey: "",

    publicKey: "",

    session: {},

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

    DefaultSigType: "RSASignature2018",

    fetch: function(url, options) {},

    // Initialize app
    init: function() {
        SolidVC.generateKeyPair();
        SolidVC.bindEvents();
        SolidVC.addPrefixes();
        SolidVC.displayStatements();
        // var session = window.localStorage.getItem("oidc.session");
        // var fetch = window.localStorage.getItem("oidc.fetch");
        // var authorization = JSON.parse(session)["authorization"];
        // var accessToken = authorization["access_token"];
        // SolidVC.session = session;
        // SolidVC.fetch = eval('(' + fetch + ')');
        // SolidVC.accessToken = accessToken;
        // var session = window.session;
        // var fetch = window.fetch;
        svcSession = window.session;
        svcFetch = window.fetch;
        // SolidVC.session = window.session;
        // SolidVC.fetch = window.fetch;
        console.log("svcSession:\n", svcSession);
        console.log("svcFetch:\n", svcFetch);
        // console.log("accessToken:\n", accessToken);
        // console.log("SolidVC.accessToken:\n", SolidVC.accessToken);
        /*var store = $rdf.graph();
        var timeout = 5000; // 5000 ms timeout
        var fetcher = new $rdf.Fetcher(store, timeout);
        fetcher.createContainer(publicRepo, "creep", null);*/
        /*if (svcSession == undefined || svcFetch == undefined) {
          location.reload();
        }*/
    },

    addPrefixes: function() {
        var prefixes = SolidVC.prefixesN3;
        for (var i = 0; i < SolidVC.prefixesN3.length; i++) {
          var prefix = prefixes[i];
          SolidVC.credentialN3 += prefix + "\n";
        }
        console.log("SolidVC.credentialN3:\n", SolidVC.credentialN3);
    },

    // Load user profile
    loadProfile: function (webId) {
        var store = $rdf.graph();
        fetcher.nowOrWhenFetched(webId, function(ok, body, xhr) {
            if (!ok) {
              console.log("Oops, something happened and couldn't fetch data");
            } else {
              try {
                var me = $rdf.sym(webId);
                var name = FOAF('name');
                var myNameObj = store.any(me, name);
                var myName = myNameObj.value;
                var img = FOAF('img');
                var myImgObj = store.any(me, img);
                var myImg = myImgObj.value;
                var knows = FOAF('knows');
                var myFriends = store.each(me, knows);
                console.log('My name:', myName);
                console.log('My image:', myImg);
                console.log('My friends:');
                for (var i = 0; i < myFriends.length; i++) {
                  var friend = myFriends[i];
                  console.log(friend.value);
                }
                document.getElementById('name').textContent = myName;
                document.getElementById('image').setAttribute('src', myImg);
                document.getElementById('profile').classList.remove('hidden');
              } catch (err) {
                console.log(err);
              }
            }
        });
    },

    // Login to app
    login: function() {
        /*auth.login().then(function(loginSession) {
            // var webId = loginSession.webId;
            console.log('loginSession:', loginSession);
            // console.log('webId', webId);
            // SolidVC.loadProfile(webId);
        }).catch(function(err) {
           console.error(err);
        });*/
        /*auth.popupLogin({popupUri: popupURI}).then(function(popupSession) {
            // var webId = popupSession.webId;
            console.log('popupSession:', popupSession);
            // console.log('webId', webId);
            // SolidVC.loadProfile(webId);
        }).catch(function(err) {
           console.error(err);
        });*/
        /*auth.currentSession().then(function(currentSession) {
            // var webId;
            if (currentSession) {
              var webId = currentSession.webId;
              console.log('currentSession:', currentSession);
              console.log('webId:', webId);
              // SolidVC.loadProfile(webId);
            } else {
              auth.popupLogin({popupUri: popupURI}).then(function(popupSession) {
                  var webId = popupSession.webId;
                  console.log('popupSession:', popupSession);
                  console.log('webId', webId);
                  // SolidVC.loadProfile(webId);
              });
            }
        });*/
    },

    // Bind events
    bindEvents: function() {
        // $(document).on("click", "#add-stmt", SolidVC.addStatement);
        // $(document).on("click", ".remove-stmt", SolidVC.removeStatement);
        // $(document).on("change", "#signature", SolidVC.handleSignatureUpload);
        // $(document).on("change", "#creator", SolidVC.handleCreatorUpload);
        $(document).on("click", "#issue-cred", SolidVC.issueCredential);
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
    generateKeyPair: function() {
        rsa.generateKeyPair({bits: 2048, workers: 2}, function(err, keypair) {
            SolidVC.privateKey = keypair.privateKey;
            SolidVC.publicKey = keypair.publicKey;
        });
    },

    // Produce signature for credential
    signCredential: function(credential, options=SolidVC.DefaultCredentialSignerOptions, credentialSigner=SolidVC.signCredentialDefault) {
        return credentialSigner(credential, options);
    },

    // Produce signature for credential
    signCredentialDefault: function(credential, options) {
        var md = forge.md.sha256.create();
        md.update(options.serializedCredential, 'utf8');
        var signature = SolidVC.privateKey.sign(md);
        credential["signature"] = {};
        credential["signature"]["@context"] = SolidVC.DefaultContext;
        credential["signature"]["@type"] = SolidVC.DefaultSigType;
        credential["signature"]["creator"] = SolidVC.creator;
        credential["signature"]["signatureValue"] = signature;
        return credential;
    },

    addStatement: function(event) {
        event.preventDefault();
        var sub = $rdf.sym($("#subject").val());
        var pred = FOAF($("#predicate").val());
        var obj = $rdf.sym($("#object").val());
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
        $("#subject").val("");
        $("#predicate").val("");
        $("#object").val("");
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
        var stmtsDiv = $("#stmts");
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
          cancelImg.attr("id", "cancel-" + i.toString());
          cancelImg.attr("class", "remove-stmt");
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
        var credPlain = $("#credPlain").val();
        var credContext = $("#credContext").val();
        var credSerialization = $("#credSerialization").val();
        if (credPlain === "") {
          alert("Please include a credential in the text area");
          $("#credPlain").focus();
          return;
        }
        if (credContext === "") {
          alert("Please select a valid context for the credential");
          $("#credContext").focus();
          return;
        }
        if (credSerialization === "") {
          alert("Please select a valid serialization for the credential");
          $("#credSerialization").focus();
          return;
        }
        /*var stmts = SolidVC.statements;
        if (stmts.length == 0) {
          alert("Please add at least one statement to credential");
          return;
        }*/
        SolidVC.credentialN3 += ":txn14 a svc:Transaction .\n";
        SolidVC.credentialN3 += ":txn14 svc:id 10 .\n";
        credPlain = "\"\"\"\n" + credPlain + "\"\"\"@en";
        /*
        credPlain = "\"\"\"\n";
        for (var i = 0; i < stmts.length; i++) {
          var stmt = stmts[i];
          var sub = stmt.sub;
          var pred = stmt.pred;
          var obj = stmt.obj;
          credPlain += sub + " " + pred + " " + obj + " .\n";
        }
        credPlain += "\"\"\"@en";
        */
        SolidVC.credentialN3 += ":txn14 svc:credPlain " + credPlain + " .\n";
        SolidVC.credentialN3 += ":txn14 svc:credSigned " + credPlain + " .\n";
        SolidVC.credentialN3 += ":txn14 svc:prevTxn " + ":txn13" + " .\n";
        SolidVC.credentialN3 += ":txn14 svc:prevHash " + ":txn13" + " .\n";
        SolidVC.credentialN3 += ":txn14 svc:issuer <" + myWebID + "> .\n";
        SolidVC.credentialN3 += ":txn14 svc:subject <" + myWebID + "> .\n";
        SolidVC.credentialN3 += ":txn14 svc:timestamp \"" + new Date() + "\" .\n";
        // console.log("SolidVC.credentialN3:\n", SolidVC.credentialN3);
        svcFetch(credentialRepo, {
            method: 'POST',
            headers: {
              'user-agent': 'Mozilla/4.0 MDN Example',
              'content-Type': 'text/n3',
              'slug': 'credential-17'
            },
            mode: 'cors',
            credentials: 'include',
            body: SolidVC.credentialN3
        })
        .then((response) => {
            console.log(response);
            // SolidVC.insertCredential();
        });
        /*$("#subject").val("");
        $("#predicate").val("");
        $("#object").val("");
        SolidVC.statements = [];*/
        $("#credPlain").val("");
        $("#credContext").val("");
        $("#credSerialization").val("");
    },

    insertCredential: function() {
        event.preventDefault();
        var store = $rdf.graph(credentialRepo + "credential-5.n3");
        var updateManager = new $rdf.UpdateManager(store);
        var sub = $rdf.sym($("#subject").val());
        var pred = FOAF($("#predicate").val());
        var obj = $rdf.sym($("#object").val());
        var stmt = new $rdf.Statement(sub, pred, obj, store);
        // var stmt = new $rdf.Statement(sub, pred, obj, credentialGraph);
        // store.add(sub, pred, obj);
        updateManager.insert_statement(stmt, () => {});
    },

    updateCredential: function() {
        event.preventDefault();
        var store = $rdf.graph(credentialRepo + "credential-5.n3");
        var updateManager = new $rdf.UpdateManager(store);
        var sub = $rdf.sym($("#subject").val());
        var pred = FOAF($("#predicate").val());
        var obj = $rdf.sym($("#object").val());
        var updatedStatement = updateManager.update_statement(new $rdf.Statement(sub, pred, obj, sub), () => {});
        updatedStatement.set_object(sub, () => {});
    },

    // Verify credential has proper signature
    verifyCredential: function(credential, pubKey, sig) {
    }
};

$(window).on("load", function() {
    SolidVC.init();
});
