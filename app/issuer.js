// 'use strict';
// Solid Verifiable Credentials Issuer

// Libraries and dependencies
var $rdf = require('rdflib');
// var $auth_cli = require('solid-auth-cli');
var util = require('./util.js');
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
var homeUri = 'http://localhost:8080/';
var popupUri = homeUri + 'popup.html';

// RDF namespaces
var SUB = $rdf.Namespace('#'); // Changes to subjects account in `issueCredential`
var META = $rdf.Namespace(metaFile + '#');
var SVC = $rdf.Namespace('http://dig.csail.mit.edu/2018/svc#');
var FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
var RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
var RDFS = $rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');
var WS = $rdf.Namespace('https://www.w3.org/ns/pim/space#');
var SEC = $rdf.Namespace('https://w3id.org/security#');
var LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');

var svcSession;
var svcFetch;
var SolidIss = SolidIss || {};

SolidIss = {
    // Tab links and content
    reviewTabLink: '#review-tab-link',

    reviewTabCnt: '#review-tab-cnt',

    issueTabLink: '#issue-tab-link',

    issueTabCnt: '#issue-tab-cnt',

    currentTabLink: '', // {SolidIss.reviewTabLink, SolidIss.issueTabLink}

    currentTabCnt: '', // {SolidIss.reviewTabCnt, SolidIss.issueTabCnt}

    // Initialize app
    init: function(event) {
        SolidIss.bindEvents();
        $(SolidIss.issueTabLink).click();
        SolidIss.generateKeyPair({keyType: 'RSA', bits: 2048, workers: 2});
    },

    // Bind events
    bindEvents: function() {
        $(document).on('click', '#issue-cred', SolidIss.issueCredential);
        $(document).on('click', '#review-tab-link', SolidIss.displayTab);
        $(document).on('click', '#issue-tab-link', SolidIss.displayTab);
        $(document).on('click', '#switch-acct', util.switchAccounts);
        $(document).on('click', '#switch-role', util.switchRoles);
    },

    displayTab: function(event) {
        console.log("event.target.id:", event.target.id);
        // Declare all variables
        var i, tabcontent, tablinks;

        // Get all elements with class="tabcontent" and hide them
        $('.tabcontent').css('display', 'none');

        // Get all elements with class="tablinks" and remove the class "active"
        $('.tablinks').removeClass('active');

        // Show the current tab, and add an "active" class to the button that opened the tab
        switch('#' + event.target.id) {
          case SolidIss.reviewTabLink:
            SolidIss.currentTabLink = SolidIss.reviewTabLink;
            SolidIss.currentTabCnt = SolidIss.reviewTabCnt;
            $(SolidIss.currentTabCnt).css('display', 'block');
            $(event.currentTarget).addClass('active');
            SolidIss.loadReviewTab();
            break;
          case SolidIss.issueTabLink:
            SolidIss.currentTabLink = SolidIss.issueTabLink;
            SolidIss.currentTabCnt = SolidIss.issueTabCnt;
            $(SolidIss.currentTabCnt).css('display', 'block');
            $(event.currentTarget).addClass('active');
            SolidIss.loadIssueTab();
            break;
        }
    },

    loadReviewTab: async function() {
        // var account = await util.discoverAccount(util.session.webId);
        var account = util.session.webId.split("profile/card#me")[0];
        console.log("account:", account);
        /*var pubKeyRemoteUri = await util.getPubKeyRemoteUri(account);
        console.log("Public Key URI\n" + pubKeyRemoteUri);
        var pubKeyContent = await util.getPubKeyRemoteContent(pubKeyRemoteUri);
        console.log("Public Key Content:\n" + pubKeyContent);*/
        var inbox = await util.discoverInbox(util.session.webId);
        console.log("INBOX:\n" + inbox);
        var inboxContent = await util.loadInbox(inbox);
        console.log("INBOX CONTENT:\n" + inboxContent);
    },

    loadIssueTab: async function() {
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

    DefaultSigType: 'LinkedDataSignature2015', // 'RsaSignature2018'

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
          case 'LD2015':
            rsa.generateKeyPair({bits: options.bits, workers: options.workers}, (err, keypair) => {
                SolidIss.privateKey['LD2015'] = keypair.privateKey;
                SolidIss.publicKey['LD2015'] = keypair.publicKey;
            });
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
    signCredentialDefaultJsonLD: async function(credential, options) {
        /*var md = forge.md.sha256.create();
        md.update(options.serializedCredential, 'utf8');
        var signature = SolidIss.privateKey[options.keyType].sign(md);
        credential["signature"] = {};
        credential["signature"]["@context"] = SolidIss.DefaultContext;
        credential["signature"]["@type"] = SolidIss.DefaultSigType;
        credential["signature"]["creator"] = SolidIss.creator;
        credential["signature"]["signatureValue"] = signature;*/
        var signedCredential = await util.signDocument(credential);
        return signedCredential;
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
    signCredentialDefaultN3: async function(credential, options) {
        var signature;
        var cred = $rdf.sym(SUB('cred'));
        var md = forge.md.sha256.create();
        var proof = $rdf.sym(SUB('proof'));
        var pubKey = await util.getPubKeyLocal();
        pubKey = pubKey.trim();
        var pubKeyLen = pubKey.length;
        var pubKeyPrefixSplitIdx = pubKey.indexOf('\n') + 1;
        var pubKeySuffixSplitIdx = pubKey.lastIndexOf('\n');
        var pubKeyPrefix = pubKey.slice(0, pubKeyPrefixSplitIdx);
        var pubKeyValue = pubKey.slice(pubKeyPrefixSplitIdx, pubKeySuffixSplitIdx);
        var pubKeySuffix = pubKey.slice(pubKeySuffixSplitIdx, pubKeyLen);
        pubKey = pubKeyPrefix + pubKeyValue + pubKeySuffix;
        console.log("PUB KEY LOCAL:", pubKey.split('\n'));
        credential.add(proof, RDF('type'), SEC($rdf.Literal.fromValue(options.type)));
        credential.add(proof, SEC('created'), $rdf.Literal.fromValue(new Date()));
        credential.add(proof, SEC('creator'), $rdf.Literal.fromValue(pubKey));
        // credential.add(proof, SEC('nonce'), options.nonce);
        md.update(credential.toCanonical(), 'utf8');
        signature = SolidIss.privateKey[options.keyType].sign(md);
        credential.add(proof, SEC('signatureValue'), $rdf.Literal.fromValue(signature));
        credential.add(cred, SVC('proof'), $rdf.Literal.fromValue(proof));
        return credential;
    },

    // Serialize and sign credential prior to issuance
    issueCredential: async function(event) {
        /*SolidIss.serializedCredential = SolidIss.serializeCredential(SolidIss.credential);
        SolidIss.DefaultCredentialSignerOptions.serializedCredential = SolidIss.serializedCredential;
        SolidIss.signedCredential = SolidIss.signCredential(SolidIss.credential);
        console.log("signed credential:", SolidIss.signedCredential);
        return SolidIss.signedCredential;*/
        event.preventDefault();
        var subjectId = $('#subject-id').val();
        var subjectPubKey = $('#subject-pubkey').val();
        var credPlain = $('#cred-plain').val();
        var credContext = $('#cred-context').val();
        // var credSerialization = $('#cred-serialization').val();
        if (credPlain === "") {
          alert("Please include a credential in the text area");
          $('#cred-plain').focus();
          return;
        }
        if (credContext === "") {
          alert("Please select a valid context for the credential");
          $('#cred-context').focus();
          return;
        }
        /*if (credSerialization === "") {
          alert("Please select a valid serialization for the credential");
          $("#cred-serialization").focus();
          return;
        }*/

        var credStore = $rdf.graph();
        var credPlainStore = $rdf.graph();
        var me = $rdf.sym(myWebId);
        var base = me.value;
        var type = 'text/n3';
        // TODO - change to $rdf.convert.convertToJson in order to use jsonld-signatures
        $rdf.parse(credPlain, credPlainStore, base, type, async (errParse, resParse) => {
            if (errParse) {
              console.log("errParse:\n", errParse);
              return;
            }
            SUB = $rdf.Namespace($rdf.uri.docpart(subjectId) + '#');
            var cred  = SUB('cred');
            credStore.add(cred, RDF('type'), SVC('Credential'));
            credStore.add(cred, SVC('plain'), resParse);
            credStore.add(cred, SVC('context'), SolidIss.namespaces[credContext]('ticker'));
            credStore.add(cred, SVC('subject'), $rdf.Literal.fromValue(subjectPubKey));
            // await SolidIss.signCredentialN3(credStore, {type: 'LinkedDataSignature2015' /*'RsaSignature2018'*/, keyType: /*'LD2015'*/ 'RSA'});
            await SolidIss.signCredentialJsonLD(credStore, {type: /*'LinkedDataSignature2015'*/ 'RsaSignature2018', keyType: /*'LD2015'*/ 'RSA'});
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
        var subjectInbox = await util.discoverInbox(subjectId);
        util.postOptions.headers[util.contentTypeField] = util.contentTypeN3;
        util.postOptions.body = SolidIss.credentialN3;
        SolidIss.fetcher.load(subjectInbox, util.postOptions).then((resPostCred) => {
            console.log(resPostCred);
        }).catch((err) => {
           console.error(err.name + ": " + err.message);
        });
        $('#cred-plain').val("");
        $('#cred-context').val("");
        // $('#cred-serialization').val("");
    },

    // Verify credential has proper signature
    verifyCredential: function(credential, pubKey, sig) {
    }
};

$(window).on('load', SolidIss.init);
module.exports = SolidIss;
