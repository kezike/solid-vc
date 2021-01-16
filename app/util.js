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
var VC = $rdf.Namespace('https://w3id.org/credentials/v1#');
var SEC = $rdf.Namespace('https://w3id.org/security#');
var LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');

var SolidUtil = SolidUtil || {};

SolidUtil = {
    //// BEGIN REST CONFIGURATION ////
    contentTypeField: 'content-type',
    responseTextField: 'responseText',
    slugField: 'slug',
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
      clearPreviousData: true,
      body: "" // REPLACE ME BEFORE USAGE
    },
    //// END REST CONFIGURATION ////

    //// BEGIN APP CONFIGURATION  ////
    configFile: '../config.json',
    //// END APP CONFIGURATION ////

    //// BEGIN KEY MANAGEMENT ////
    pubKeyPemFile: '../auth/pub.pem',
    privKeyPemFile: '../auth/priv.pem',
    //// END KEY MANAGEMENT ////

    //// BEGIN REVOCATION LIST CONFIGURATION ////
    pubKeyUriField: 'PUB_FILE_REMOTE',
    revListField: 'REV_FOLDER_REMOTE',
    //// END REVOCATION LIST CONFIGURATION ////

    //// BEGIN JSONLD-SIGNATURES CONFIGURATION ////
    jsigsRsaVerificationKey: 'RsaVerificationKey2018',
    //// END JSONLD-SIGNATURES CONFIGURATION ////

    //// BEGIN ONTOLOGY METADATA ////
    // SVC ontology namespace
    SVC: $rdf.Namespace('http://dig.csail.mit.edu/2018/svc#'),
    // LDP ontology namespace
    LDP: $rdf.Namespace('http://www.w3.org/ns/ldp#'),
    // SVC issuer id predicate
    svcIssuerIdField: 'issuerId',
    // SVC subject id predicate
    svcSubjectIdField: 'subjectId',
    // SVC revocation list predicate
    svcRevListField: 'revocationList',
    // SVC credential status predicate
    svcCredStatusField: 'credentialStatus',
    // SVC credential active status
    svcCredStatusActive: 'ACTIVE',
    // SVC credential active status
    svcCredStatusExpired: 'EXPIRED',
    // SVC credential revoked status
    svcCredStatusRevoked: 'REVOKED',
    // SVC credential id predicate
    svcCredIdField: 'credentialId',
    // SVC revocation reason predicate
    svcRevReasonField: 'revocationReason',
    // SVC revocation date predicate
    svcRevDateField: 'revocationDate',
    // VC credential status predicate
    vcCredStatus: 'credentialStatus',
    // SEC public key predicate
    secPubKeyField: 'publicKey',
    // SEC owner predicate
    secOwnerField: 'owner',
    // SEC controller predicate
    secControllerField: 'controller',
    // SOLID account predicate
    solidAccountField: 'account',
    // LDP inbox predicate
    ldpInboxField: 'inbox',
    // LDP contains predicate
    ldpContainsField: 'contains',
    foafHomepageField: 'homepage',
    //// END ONTOLOGY METADATA ////

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
    // Serializations
    n3: 'n3',
    jsonld: 'ttl',
    jsonld: 'jsonld',
    //// END GENERAL SOLID/LD TERMS ////

    //// BEGIN APP ////
    // Home page of SolidVC app
    homePage: '/',
    popupUri: 'popup.html',

    // Message element info
    messageInfo: [], // has fields 'uri', 'inspectId', 'verifyId', 'downloadId'

    // Action element id delimiter
    actionElemIdDelim: '-',

    // Minimum unique number
    minUniqueNum: 0,

    // Maximum unique number
    maxUniqueNum: 1000000000000000,

    // Initialize app
    init: async function(event) {
        // SolidUtil.login();
        // console.log('$auth.fetch:', $auth.fetch);
    },

    // Bind val to key in obj
    bindKeyValue: function(obj, key, val) {
        obj[key] = val;
    },

    // Load subject page
    loadSubject: async function(event) {
        await SolidUtil.trackSession();
        SolidUtil.role = 'subject';
        SolidUtil.webPage = SolidUtil.role + '.html';
        window.location.href = SolidUtil.webPage;
    },

    // Load issuer page
    loadIssuer: async function(event) {
        await SolidUtil.trackSession();
        SolidUtil.role = 'issuer';
        SolidUtil.webPage = SolidUtil.role + '.html';
        window.location.href = SolidUtil.webPage;
    },

    // Load verifier page
    loadVerifier: async function(event) {
        await SolidUtil.trackSession();
        SolidUtil.role = 'verifier';
        SolidUtil.webPage = SolidUtil.role + '.html';
        window.location.href = SolidUtil.webPage;
    },

    // Load inbox page
    loadInbox: async function(event) {
        await SolidUtil.trackSession();
        var inbox = SolidUtil.getMyInbox();
        var inboxContent = await SolidUtil.loadInboxContent(inbox);
        console.log(`INBOX: ${inbox}`);
        console.log(`INBOX CONTENT:\n${inboxContent}`);
        $('#inbox').empty();
        for (var i = 0; i < inboxContent.length; i++) {
          var inboxItem = inboxContent[i];
          var messageUri = inboxItem.object.value;
          var messageObj = {uri: messageUri};
          var reqMsgElem = SolidUtil.formatRequestMessageElement(messageObj, i);
          SolidUtil.messageInfo.push(messageObj);
          $('#inbox').append(reqMsgElem);
        }
        SolidUtil.verifyRequests();
        SolidUtil.role = 'inbox';
        SolidUtil.webPage = SolidUtil.role + '.html';
        window.location.href = SolidUtil.webPage;
    },

    //// BEGIN INBOX FUNCTIONS ////
    verifyRequests: async function() {
        for (var i = 0; i < SolidUtil.messageInfo.length; i++) {
          var messageObj = SolidUtil.messageInfo[i];
          var messageUri = messageObj.uri;
          var messageVerifyId = messageObj.verifyId;
          console.log(`messageVerifyId: ${messageVerifyId}`);
          var verifyResult = await util.verifyDocument(messageUri, {checkCredStatus: false, verifyRequest: true});
          // TODO - Set 'src' attribute of verifyRequest img and remove 'hidden' class
          var messageVerifyElem = $('#' + messageVerifyId);
          console.log(`verifyRequestsResult: ${verifyResult.verified}`);
          if (verifyResult.verified) {
            var verifyImageElem = messageVerifyElem.find(".verify-img");
            console.log(`verifyImageElem: ${verifyImageElem}`);
            verifyImageElem.attr('src', "./img/approve.png");
            messageVerifyElem.removeClass('hidden');
          } else {
            var verifyImageElem = messageVerifyElem.find(".verify-img");
            console.log(`verifyImageElem: ${JSON.stringify(verifyImageElem)}`);
            verifyImageElem.attr('src', "./img/decline.png");
            messageVerifyElem.removeClass('hidden');
          }
        }
    },

    formatActionElementIdx: function(actionId, idx) {
        return parseInt(actionId.split(SolidUtil.actionElemIdDelim)[1]);
    },

    formatActionElementId: function(action, idx) {
        return action + SolidUtil.actionElemIdDelim + idx;
    },

    formatRequestMessageElement: function(messageObj, messageIdx) {
        var credReqMsgLabel = `Credential Request ${messageIdx + 1}`;
        var inspectId = SolidUtil.formatActionElementId("inspect", messageIdx);
        /*var approveId = SolidUtil.formatActionElementId("approve", messageIdx);
        var declineId = SolidUtil.formatActionElementId("decline", messageIdx);*/
        var verifyId = SolidUtil.formatActionElementId("verify", messageIdx);
        var downloadId = SolidUtil.formatActionElementId("download", messageIdx);
        messageObj.inspectId = inspectId;
        messageObj.verifyId = verifyId;
        messageObj.downloadId = downloadId;
        var messageUri = messageObj.uri;
        var header = "<tr>";
        var bodyLine1 = `<td style="padding:15px"><h4 style="color:blue; display:inline"><a href=${messageUri} target="_blank">${credReqMsgLabel}</a></h4></td>`;
        var bodyLine2 = `<td id="${inspectId}" class="inspect-cred" style="padding:15px"><input type="image" src="./img/inspect.png" height=25 width=25 style="display:inline; left:50em" /></td>`;
        /*var bodyLine3 = `<td id="${approveId}" class="approve-cred" style="padding:15px"><input type="image" src="./img/approve.png" height=25 width=25 style="display:inline; left:50em" /></td>`;
        var bodyLine4 = `<td id="${declineId}" class="decline-cred" style="padding:15px"><input type="image" src="./img/decline.png" height=25 width=25 style="display:inline; left:50em" /></td>`;
        var body = `${bodyLine1}${bodyLine2}${bodyLine3}${bodyLine4}`;*/
        var bodyLine3 = `<td id="${downloadId}" class="download-msg" style="padding:15px"><input type="image" src="./img/download.png" height=25 width=25 style="display:inline; left:50em" /></td>`;
        var bodyLine4 = `<td id="${verifyId}" class="verify-request hidden" style="padding:15px"><img class="verify-img" src="" height=25 width=25 style="display:inline; left:50em" /></td>`;
        var body = `${bodyLine1}${bodyLine2}${bodyLine3}${bodyLine4}`;
        var footer = "</tr>";
        var message = `${header}${body}${footer}`;
        return message;
    },

    inspectCredential: async function(event) {
        // Retrieve relevant DOM elements
        var inspectCredElem = $(event.target).closest(".inspect-cred");
        var inspectCredElemId = inspectCredElem.attr('id');
        var messageModal = $("#msg-modal");
        console.log(`Inspect Credential Target: ${inspectCredElemId}`);
        
        // Fetch credential request message
        var inspectCredElemIdx = SolidUtil.formatActionElementIdx(inspectCredElemId);
        var messageUri = SolidUtil.messageInfo[inspectCredElemIdx].uri;
        var message = await util.genericFetch(messageUri);
        
        // Populate and display credential request message modal
        var messageModalText = $("#msg-modal-text");
        messageModalText.text(message);
        messageModal.css("display","block");
        
        // Close credential inpection modal when button pressed
        $(document).on('click', "#msg-modal-close", () => {
            messageModal.css("display","none");
        });
    },

    downloadMessage: async function(event) {
        // Retrieve relevant DOM elements
        var downloadMsgElem = $(event.target).closest(".download-msg");
        var downloadMsgElemId = downloadMsgElem.attr('id');

        // Fetch message
        var downloadMsgElemIdx = SolidUtil.formatActionElementIdx(downloadMsgElemId);
        var messageUri = SolidUtil.messageInfo[downloadMsgElemIdx].uri;
        var message = await util.genericFetch(messageUri);
        
        // Download message
        var downloadId = SolidUtil.messageInfo[downloadMsgElemIdx].downloadId;
        util.downloadFile(message, downloadId);
    },

    // Get personal inbox
    getMyInbox: function() {
        return SolidUtil[SolidUtil.ldpInboxField];
    },
    //// END INBOX FUNCTIONS ////

    // Get personal WebID
    getMyWebId: function() {
        return SolidUtil.session.webId;
    },

    // Retrieve svc public key URI
    getMyPubKeyUri: function() {
        console.log(`GET MY PUB KEY URI: ${SolidUtil[SolidUtil.pubKeyUriField]}`);
        return SolidUtil[SolidUtil.pubKeyUriField];
    },

    // Retrieve svc revocation list
    getMyRevList: function() {
        return SolidUtil[SolidUtil.revListField];
    },

    // Get new unique number
    getUniqueNumber: function() {
        var min = Math.ceil(SolidUtil.minUniqueNum);
        var max = Math.floor(SolidUtil.maxUniqueNum);
        return Math.floor(Math.random() * (max - min)) + min;
    },

    // Retrieve status of credential
    getCredStatus: async function(credStatusUri) {
        await SolidUtil.fetcher.load(credStatusUri);
        const credStatusQueryResult = SolidUtil.fetcher.store.match(undefined, SVC(SolidUtil.svcCredStatusField), undefined);
        if (credStatusQueryResult.length == 0) {
          return null;
        }
        const credStatus = credStatusQueryResult[0].object.value;
        return credStatus;
    },

    // Retrieve reason for credential revocation
    getRevReason: async function(credStatusUri) {
        await SolidUtil.fetcher.load(credStatusUri);
        const credStatusQueryResult = SolidUtil.fetcher.store.match(undefined, SVC(SolidUtil.svcRevReasonField), undefined);
        if (credStatusQueryResult.length == 0) {
          return null;
        }
        const revReason = credStatusQueryResult[0].object.value;
        return revReason;
    },

    // Retrieve date of credential revocation
    getRevDate: async function(credStatusUri) {
        await SolidUtil.fetcher.load(credStatusUri);
        const credStatusQueryResult = SolidUtil.fetcher.store.match(undefined, SVC(SolidUtil.svcRevDateField), undefined);
        if (credStatusQueryResult.length == 0) {
          return null;
        }
        const revDate = credStatusQueryResult[0].object.value;
        return revDate;
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
        // SolidUtil.bindKeyValue(SolidUtil, 'THIS', $rdf.Namespace($rdf.uri.docpart(SolidUtil.getMyWebId()) + '#'));
        // var inbox = "https://kezike.solid.community/inbox/";
        var inbox = await SolidUtil.discoverInbox(SolidUtil.getMyWebId());
        SolidUtil.bindKeyValue(SolidUtil, SolidUtil.ldpInboxField, inbox);
        var configStr = await SolidUtil.readFile(SolidUtil.configFile);
        var configObj = JSON.parse(configStr);
        var pubKeyFileRemote = configObj[SolidUtil.pubKeyUriField];
        var revListFolder = configObj[SolidUtil.revListField];
        console.log(`CONFIG OBJ:\n${configObj}`);
        console.log(`PUB FILE REMOTE:\n${pubKeyFileRemote}`);
        console.log(`REV LIST FOLDER:\n${revListFolder}`);
        SolidUtil.bindKeyValue(SolidUtil, SolidUtil.pubKeyUriField, pubKeyFileRemote);
        SolidUtil.bindKeyValue(SolidUtil, SolidUtil.revListField, revListFolder);
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

    // Navigate to SolidVC homepage
    navigateHome: function(event) {
        console.log("Navigating Home...")
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
        var base = SolidUtil.getMyWebId();
        var parsed = await SolidUtil.parse(text, store, base, typeFrom);
        var target = null;
        var serialized = await SolidUtil.serialize(target, parsed, base, typeTo);
        return serialized;
    },

    // Merge two graph stores
    merge: function(store1, store2) {
        var outStore = $rdf.graph();
        store1.statements.forEach((statement) => {
            outStore.add(statement);
        });
        store2.statements.forEach((statement) => {
            outStore.add(statement);
        });
        return outStore;
    },

    // Retrieve generic json content at target
    genericFetch: async function(target) {
        var fetchPromise = await SolidUtil.fetcher.load(target);
        return fetchPromise[SolidUtil.responseTextField];
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
        await SolidUtil.fetcher.load(target);
        var account = SolidUtil.fetcher.store.any($rdf.sym(target), SOLID(SolidUtil.solidAccountField), undefined);
        return account.value;
    },

    // Discover the inbox of a target via LDN
    discoverInbox: async function(target) {
        await SolidUtil.fetcher.load(target);
        var inbox = SolidUtil.fetcher.store.any($rdf.sym(target), LDP(SolidUtil.ldpInboxField), undefined);
        return inbox.value;
    },

    // Load content of inbox
    loadInboxContent: async function(inbox) {
        await SolidUtil.fetcher.load(inbox);
        var inboxContent = SolidUtil.fetcher.store.match($rdf.sym(inbox), LDP(SolidUtil.ldpContainsField), undefined);
        return inboxContent;
    },

    // Retrieve URI of svc public key of a remote target
    getPubKeyRemoteUri: async function(target) {
        await SolidUtil.fetcher.load(target);
        var pubKeyUri = SolidUtil.fetcher.store.any($rdf.sym(target), SEC(SolidUtil.secPubKeyField), undefined);
        return pubKeyUri.value;
    },

    // Retrieve content of svc public key of a remote target
    getPubKeyRemoteContent: async function(target) {
        var pubKeyUri = await SolidUtil.getPubKeyRemoteUri(target);
        var pubKeyPromise = await SolidUtil.fetcher.load(pubKeyUri);
        return pubKeyPromise[SolidUtil.responseTextField];
    },

    // Retrieve content of local file
    readFile: async function (keyFile) {
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

    // Download content into local file
    downloadFile: async function (content, filename) {
        var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
        downloader.saveAs(blob, filename);
    },

    // Retrieve local svc public key
    getPubKeyLocal: async function() {
        var pubKey = await SolidUtil.readFile(SolidUtil.pubKeyPemFile);
        return pubKey;
    },

    // Retrieve local svc private key
    getPrivKeyLocal: async function() {
        var privKey = await SolidUtil.readFile(SolidUtil.privKeyPemFile);
        return privKey;
    },
    
    // Sign document
    signDocument: async function(doc, /*signConfig*/) {
        // Specify signature configuration (ie., suite and purpose and setup key pair)
        // TODO - allow specification of creator and algorithm in signConfig
        const {RsaSignature2018} = jsigs.suites;
        const {AssertionProofPurpose} = jsigs.purposes;
        const {RSAKeyPair} = jsigs;
        const publicKeyPem = await SolidUtil.getPubKeyLocal();
        const privateKeyPem = await SolidUtil.getPrivKeyLocal();
        const issuerId = SolidUtil.getMyWebId();
        const pubKeyId = SolidUtil.getMyPubKeyUri();
        console.log(`My Pub Key ID: ${pubKeyId}`);
        console.log(`My Pub Key ID Stringified: ${JSON.stringify(pubKeyId)}`);
        var publicKey = {
            "@context": jsigs.SECURITY_CONTEXT_URL,
            type: SolidUtil.jsigsRsaVerificationKey,
            id: pubKeyId,
            controller: issuerId,
            publicKeyPem
        };
        const key = new RSAKeyPair({...publicKey, privateKeyPem});
        var signConfig = {
          suite: new RsaSignature2018({key}),
          purpose: new AssertionProofPurpose()
        };

        // Sign the document as a simple assertion
        const signedDoc = await jsigs.sign(doc, signConfig);
        console.log("Signed document:");
        console.log(signedDoc);
        return signedDoc;
    },

    // Verify document
    /*
       User may pass in verification configuration parameters with the following keys:
       checkCredStatus: Determines whether to check credential status during verification
       verifyRequest: Determines whether this is a request verification
    */
    verifyDocument: async function(signedDocUri) {
        // Specifying verification configuration
        var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        console.log(config);
        var checkCredStatus = ("checkCredStatus" in config) ? config.checkCredStatus : true;
        var verifyRequest = ("verifyRequest" in config) ? config.verifyRequest : false;

        // Verification result
        var result = { verified: false, error: {} };

        // Fetch signed credential into local store
        const signedDocStr = await SolidUtil.genericFetch(signedDocUri);
        const signedDocStore = await SolidUtil.parse(signedDocStr, $rdf.graph(), SolidUtil.getMyWebId(), SolidUtil.contentTypeJsonLd);

        // Discover credential issuer ID
        const issuerId = signedDocStore.match(undefined, SVC(SolidUtil.svcIssuerIdField), undefined)[0].object.value;
        const subjectId = signedDocStore.match(undefined, SVC(SolidUtil.svcSubjectIdField), undefined)[0].object.value;
        const controllerId = verifyRequest ? subjectId : issuerId;
        const pubKeyId = await SolidUtil.getPubKeyRemoteUri(controllerId);
        /*console.log(`Pub key ID: ${pubKeyId}`);
        console.log(`Pub key ID Stringified: ${JSON.stringify(pubKeyId)}`);*/
        const controllerPubKey = await SolidUtil.getPubKeyRemoteContent(controllerId);
        const publicKeyPem = controllerPubKey;
        /*console.log(`Issuer ID: ${issuerId}`);
        console.log(`Pub key ID: ${pubKeyId}`);
        console.log(`Issuer Pub Key:\n${controllerPubKey}`);*/

        console.log(`CHECK CRED STATUS: ${checkCredStatus}`);
        if (checkCredStatus) {
          // Discover credential issuer revocation list
          const credStatusUri = signedDocStore.match(undefined, VC(SolidUtil.vcCredStatus), undefined)[0].object.value;
          console.log(`Cred Status URI: ${credStatusUri}`);
          const credStatus = await SolidUtil.getCredStatus(credStatusUri);
          console.log(`Cred Status: ${credStatus}`);
          switch(credStatus) {
              case null:
                result.verified = false;
                result.error.message = 'The issuer of this credential has moved the credential status list';
                return;
              case SolidUtil.svcCredStatusActive:
                break;
              case SolidUtil.svcCredStatusExpired:
                result.verified = false;
                result.error.message = 'This credential has expired';
                return result;
              case SolidUtil.svcCredStatusRevoked:
                result.verified = false;
                let revReason = await SolidUtil.getRevReason(credStatusUri);
                let revDate = await SolidUtil.getRevDate(credStatusUri);
                if (!revReason) {
                  revReason = `Issuer with ID '${issuerId}' neglected to provide reason for revocation`;
                }
                result.error.message = `This credential was revoked on ${revDate} by issuer with ID '${issuerId}' for the following reason: '${revReason}'`;
                return result;
              default:
                result.verified = false;
                result.error.message = 'Cannot properly verify this credential because it does not include a valid status';
                return result;
          }
        }

        // Parse JSON-LD string into JSON in preparation for verification
        const signedDoc = JSON.parse(signedDocStr);

        // Specify the public key
        const publicKey = {
            "@context": jsigs.SECURITY_CONTEXT_URL,
            type: SolidUtil.jsigsRsaVerificationKey,
            id: pubKeyId,
            controller: controllerId,
            publicKeyPem
        };

        // Specify the public key controller
        const controller = {
            "@context": jsigs.SECURITY_CONTEXT_URL,
            id: controllerId,
            publicKey: [publicKey],
            assertionMethod: [publicKey.id]
        };

        // Setup jsonld-signaures verification
        const {RsaSignature2018} = jsigs.suites;
        const {AssertionProofPurpose} = jsigs.purposes;
        const {RSAKeyPair} = jsigs;
        const privateKeyPem = null; // We do not know the private key of the signer
        console.log(`Verifying signed credential with key pair:\n${privateKeyPem}\n${controllerPubKey}`);
        const key = new RSAKeyPair({...publicKey, privateKeyPem});
        result = await jsigs.verify(signedDoc, {
          suite: new RsaSignature2018({key}),
          purpose: new AssertionProofPurpose({controller})
        });
        return result;
    }
    //// END APP ////
};

// $(window).on('load', SolidUtil.init);
module.exports = SolidUtil;
