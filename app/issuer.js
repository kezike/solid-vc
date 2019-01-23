// 'use strict';
// Solid Verifiable Credentials Issuer

// Libraries and dependencies
var $rdf = require('rdflib');
var util = require('./util.js');
var forge = require('node-forge');
var ed25519 = forge.pki.ed25519;
var rsa = forge.pki.rsa;

// RDF namespaces
var SUB = $rdf.Namespace('#'); // Changes to subject account in `issueCredential`
var SVC = $rdf.Namespace('http://dig.csail.mit.edu/2018/svc#');
var VC = $rdf.Namespace('https://w3id.org/credentials/v1#');
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
    credential: {},
    credentialN3: "",
    namespaces: {
        svcEdu: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-edu#'),
        svcFin: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-fin#'),
        svcGen: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-gen#'),
        svcGov: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-gov#'),
        svcHealth: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-health#'),
        svcLaw: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-law#'),
        svcMed: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-med#'),
        svcProf: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-prof#'),
        svcTrans: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-trans#'),
        svcTravel: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc-travel#')
    },
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
                  "@prefix svcProf: <http://dig.csail.mit.edu/2018/svc-prof#> .",
                  "@prefix svcTrans: <http://dig.csail.mit.edu/2018/svc-trans#> .",
                  "@prefix svcTravel: <http://dig.csail.mit.edu/2018/svc-travel#> ."
    ],

    serializedCredential: "",
    signedCredential: {},
    signature: "",
    creator: "",
    privateKey: {},
    publicKey: {},
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
      "sec": "https://w3id.org/security/v2"
    },
    DefaultSigType: 'RsaSignature2018', // 'LinkedDataSignature2015'

    //// BEGIN APP ////
    // Tab links and content
    issueTabLink: '#issue-tab-link',
    issueTabCnt: '#issue-tab-cnt',
    reviewTabLink: '#review-tab-link',
    reviewTabCnt: '#review-tab-cnt',
    currentTabLink: '', // { SolidIss.issueTabLink, SolidIss.reviewTabLink }
    currentTabCnt: '', // { SolidIss.issueTabCnt, SolidIss.reviewTabCnt }
    
    // Message element ids
    messageIds: [],

    // Action element id delimiter
    actionElemIdDelim: '-',
    
    // SolidVC roles and associated web pages
    role: "",
    webPage: "",

    // Initialize app
    init: function(event) {
        SolidIss.bindEvents();
        $(SolidIss.issueTabLink).click();
        // SolidIss.generateKeyPair({keyType: 'RSA', bits: 2048, workers: 2});
    },

    // Bind events
    bindEvents: function() {
        $(document).on('click', '#issue-cred', SolidIss.issueCredential);
        $(document).on('click', '#issue-tab-link', SolidIss.displayTab);
        $(document).on('click', '#review-tab-link', SolidIss.displayTab);
        $(document).on('click', '.inspect-cred', SolidIss.inspectCredential);
        $(document).on('click', '.approve-cred', SolidIss.approveCredential);
        $(document).on('click', '.decline-cred', SolidIss.declineCredential);
        $(document).on('click', '#-acct', util.switchAccounts);
        $(document).on('click', '#switch-role', util.switchRoles);
    },

    // Display tab
    displayTab: async function(event) {
        console.log("event.target.id:", $(event.target).attr('id'));

        // Get all elements with class="tabcontent" and hide them
        $('.tabcontent').css('display', 'none');

        // Get all elements with class="tablinks" and remove the class "active"
        $('.tablinks').removeClass('active');

        // Show the current tab, and add an "active" class to the button that opened the tab
        switch('#' + $(event.target).attr('id')) {
          case SolidIss.issueTabLink:
            SolidIss.currentTabLink = SolidIss.issueTabLink;
            SolidIss.currentTabCnt = SolidIss.issueTabCnt;
            $(SolidIss.currentTabCnt).css('display', 'block');
            $(event.currentTarget).addClass('active');
            await SolidIss.loadIssueTab();
            break;
          case SolidIss.reviewTabLink:
            SolidIss.currentTabLink = SolidIss.reviewTabLink;
            SolidIss.currentTabCnt = SolidIss.reviewTabCnt;
            $(SolidIss.currentTabCnt).css('display', 'block');
            $(event.currentTarget).addClass('active');
            await SolidIss.loadReviewTab();
            break;
        }
    },

    // Load content of review tab
    loadReviewTab: async function() {
        await util.trackSession();
        var inbox = util.getInbox();
        var inboxContent = await util.loadInbox(inbox);
        console.log(`INBOX: ${inbox}`);
        console.log(`INBOX CONTENT:\n${inboxContent}`);
        $('#msg-board').empty();
        for (var i = 0; i < inboxContent.length; i++) {
          var inboxItem = inboxContent[i];
          var messageId = inboxItem[util.ldObjField][util.ldTermValueField];
          var reqMsgElem = SolidIss.formatRequestMessageElement(messageId, i);
          $('#msg-board').append(reqMsgElem);
          SolidIss.messageIds.push(messageId);
        }
    },

    // Load content of issue tab
    loadIssueTab: async function() {
        await util.trackSession();
        var revList = await util.getRevListLocal();
        console.log(`Rev List: ${revList}`);
    },

    formatActionElementIdx: function(actionId, idx) {
        return parseInt(actionId.split(SolidIss.actionElemIdDelim)[1]);
    },

    formatActionElementId: function(action, idx) {
        return action + SolidIss.actionElemIdDelim + idx;
    },

    formatRequestMessageElement: function(messageId, messageIdx) {
        var credReqMsgLabel = `Credential Request ${messageIdx + 1}`;
        var inspectId = SolidIss.formatActionElementId("inspect", messageIdx);
        var approveId = SolidIss.formatActionElementId("approve", messageIdx);
        var declineId = SolidIss.formatActionElementId("decline", messageIdx);
        var header = "<tr>";
        var bodyLine1 = `<td style="padding:15px"><h4 style="color:blue; display:inline"><a href=${messageId} target="_blank">${credReqMsgLabel}</a></h4></td>`;
        var bodyLine2 = `<td id=${inspectId} class=inspect-cred style="padding:15px"><input type="image" src="./img/inspect.png" height=25 width=25 style="display:inline; left:50em" /></td>`;
        var bodyLine3 = `<td id=${approveId} class=approve-cred style="padding:15px"><input type="image" src="./img/approve.png" height=25 width=25 style="display:inline; left:50em" /></td>`;
        var bodyLine4 = `<td id=${declineId} class=decline-cred style="padding:15px"><input type="image" src="./img/decline.png" height=25 width=25 style="display:inline; left:50em" /></td>`;
        var body = `${bodyLine1}${bodyLine2}${bodyLine3}${bodyLine4}`;
        var footer = "</tr>";
        var message = `${header}${body}${footer}`;
        return message;
    },

    inspectCredential: async function(event) {
        // Retrieve relevant DOM elements
        var actionElem = $(event.target).closest(".inspect-cred");
        var actionElemId = actionElem.attr('id');
        var messageModal = $("#msg-modal");
        var closeButton = $(event.target).closest(".close");
        var closeButtonId = closeButton.attr('id');
        console.log(`Inspect Credential Target: ${actionElemId}`);
        
        // Fetch credential request message
        var actionElemIdx = SolidIss.formatActionElementIdx(actionElemId);
        var messageUri = SolidIss.messageIds[actionElemIdx];
        var message = await util.genericFetch(messageUri);
        
        // Populate and display credential request message modal
        var messageModalText = $("#msg-modal-text");
        messageModalText.text(message);
        messageModal.css("display","block");
        
        // Close credential inpection modal when button pressed
        $(document).on('click', closeButtonId, () => {
            messageModal.css("display","none");
        });
        
        // Close credential inpection modal when click scope is out of modal bounds
        $(document).on('click', (event) => {
            if (event.target == messageModal) {
              messageModal.css("display","none");
            }
        });
    },

    approveCredential: async function(event) {
        console.log(`Approve Credential Target: ${event.currentTarget}`);
    },

    declineCredential: async function(event) {
        console.log(`Decline Credential Target: ${event.currentTarget}`);
    },

    // Handle credential upload
    handleCredentialUpload: function(event) {
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
        credential.add(cred, SEC('proof'), $rdf.Literal.fromValue(proof));
        return credential;
    },

    // Serialize and sign credential prior to issuance
    issueCredential: async function(event) {
        event.preventDefault();
        await util.trackSession();

        // Retrieve relevant credential elements
        var credPlainElem = $('#cred-plain');
        var credDomainElem = $('#cred-domain');
        // var credSerializationElem = $('#cred-serialization');
        var subjectIdElem = $('#subject-id');
        var credPlain = credPlainElem.val();
        var credDomain = credDomainElem.val();
        // var credSerialization = credDomainElem.val();
        var subjectId = subjectIdElem.val();
        var issuerId = util.getWebId();
        var revList = await util.getRevListLocal();
        var uniqueNum = util.getUniqueNumber();
        var svcCredStatus = 'ACTIVE';
        var credId = `${revList}/${uniqueNum}`;
        var vcCredStatus = `${credId}.${util.n3}`;
        var credTitle = `${credDomain} Credential for Subject with ID '${subjectId}'`;
        var credDesc = `Congratualations! By the powers vested in me as issuer with ID '${issuerId}', I hereby grant subject with ID '${subjectId}' a credential of type ${credDomain}`;
        var messageType = 'ISSUANCE';

        // Validate inputs
        if (subjectId === "") {
          alert("Please provide a valid subject ID");
          subjectIdElem.focus();
          return;
        }
        if (credPlain === "") {
          alert("Please provide a valid credential");
          credPlainElem.focus();
          return;
        }
        if (credDomain === "") {
          alert("Please select a valid domain for the credential");
          credDomainElem.focus();
          return;
        }
        /*if (credSerialization === "") {
          alert("Please select a valid serialization for the credential");
          $("#cred-serialization").focus();
          return;
        }*/

        // Parse n3 credential into rdf graph
        var credStore = await util.parse(credPlain, $rdf.graph(), issuerId, util.contentTypeN3);
        console.log(`credStore: ${credStore}`);

        // Add credential metadata statements to graph
        var cred = credStore.statements[0].subject;
        credStore.add(cred, RDF('type'), SVC('Credential'));
        credStore.add(cred, SVC('id'), $rdf.Literal.fromValue(credId));
        credStore.add(cred, SVC('domain'), $rdf.Literal.fromValue(credDomain));
        credStore.add(cred, SVC('title'), $rdf.Literal.fromValue(credTitle));
        credStore.add(cred, SVC('description'), $rdf.Literal.fromValue(credDesc));
        credStore.add(cred, SVC('subjectId'), $rdf.Literal.fromValue(subjectId));
        credStore.add(cred, SVC('issuerId'), $rdf.Literal.fromValue(issuerId));
        credStore.add(cred, SVC('messageType'), $rdf.Literal.fromValue(messageType));
        credStore.add(cred, VC('credentialStatus'), $rdf.Literal.fromValue(vcCredStatus));

        // Convert credential into JSON-LD for jsonld-signatures
        var credJsonLdStr = await util.serialize(null, credStore, issuerId, util.contentTypeJsonLd);
        console.log("credJsonLdStr\n:" + credJsonLdStr);
        var credJsonLd = JSON.parse(credJsonLdStr)[0];
        var credSignedJsonLd = await SolidIss.signCredentialJsonLD(credJsonLd, {type: 'RsaSignature2018', keyType: 'RSA'});
        var credSignedJsonLdStr = JSON.stringify(credSignedJsonLd, null, 4);
        console.log(`credSignedJsonLdStr:\n${credSignedJsonLdStr}`);
        var subjectInbox = await util.discoverInbox(subjectId);
        util.postOptions.headers[util.contentTypeField] = util.contentTypePlain;
        util.postOptions.body = credSignedJsonLdStr;
        await util.fetcher.load(subjectInbox, util.postOptions);

        // Update revocation list with credential status
        var revStore = $rdf.graph();
        var REV = $rdf.Namespace(revList);
        var rev = REV('status'); 
        revStore.add(rev, RDF('type'), SVC('Credential'));
        revStore.add(rev, SVC('credentialId'), $rdf.Literal.fromValue(credId));
        revStore.add(rev, SVC('credentialStatus'), $rdf.Literal.fromValue(svcCredStatus));
        var revN3Str = await util.serialize(null, revStore, issuerId, util.contentTypeN3);
        util.postOptions.headers[util.contentTypeField] = util.contentTypeN3;
        util.postOptions.headers[util.slugField] = credId;
        util.postOptions.body = revN3Str;
        util.fetcher.load(revList, util.postOptions);

        // Clear input fields
        subjectIdElem.val("");
        credPlainElem.val("");
        credDomainElem.val("");
        // credSerializationElem.val("");
    }
    //// END APP ////
};

$(window).on('load', SolidIss.init);
module.exports = SolidIss;
