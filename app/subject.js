// Solid Verifiable Credentials Subject

// Libraries and dependencies
var $rdf = require('rdflib');
var util = require('./util.js');

// RDF Namespaces
var SVC = $rdf.Namespace('http://dig.csail.mit.edu/2018/svc#');
var RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

var SolidSub = SolidSub || {};

SolidSub = {
    //// BEGIN APP ////
    // Tab links and content
    requestTabLink: '#request-tab-link',
    requestTabCnt: '#request-tab-cnt',
    shareTabLink: '#share-tab-link',
    shareTabCnt: '#share-tab-cnt',
    currentTabLink: '', // { SolidSub.requestTabLink, SolidSub.shareTabLink }
    currentTabCnt: '', // { SolidSub.requestTabCnt, SolidSub.shareTabCnt }

    // Initialize app
    init: function(event) {
        SolidSub.bindEvents();
        $(SolidSub.requestTabLink).click();
        // SolidSub.generateKeyPair({keyType: 'RSA', bits: 2048, workers: 2});
    },

    // Bind events
    bindEvents: function() {
        $(document).on('click', '#request-cred', SolidSub.requestCredential);
        $(document).on('click', '#share-cred', SolidSub.shareCredential);
        $(document).on('click', '#request-tab-link', SolidSub.displayTab);
        $(document).on('click', '#share-tab-link', SolidSub.displayTab);
        $(document).on('click', '#switch-acct', util.switchAccounts);
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
          case SolidSub.requestTabLink:
            SolidSub.currentTabLink = SolidSub.requestTabLink;
            SolidSub.currentTabCnt = SolidSub.requestTabCnt;
            $(SolidSub.currentTabCnt).css('display', 'block');
            $(event.currentTarget).addClass('active');
            await SolidSub.loadRequestTab();
            break;
          case SolidSub.shareTabLink:
            SolidSub.currentTabLink = SolidSub.shareTabLink;
            SolidSub.currentTabCnt = SolidSub.shareTabCnt;
            $(SolidSub.currentTabCnt).css('display', 'block');
            $(event.currentTarget).addClass('active');
            await SolidSub.loadShareTab();
            break;
        }
    },

    // Load content of request tab
    loadRequestTab: async function() {
        await util.trackSession();
    },

    // Load content of share tab
    loadShareTab: async function() {
        await util.trackSession();
    },

    // Share credential with stakeholders
    shareCredential: async function(event) {
        event.preventDefault();
        await util.trackSession();
        
        // Retrieve relevant share elements
        var shareCredUriElem = $('#share-cred-uri');
        var shareCredUri = shareCredUriElem.val();
        var verifierIdElem = $('#verifier-id');
        var verifierId = verifierIdElem.val();

        // Validate inputs
        if (shareCredUri === "") { // TODO - Add condition for validating proper URI format
          alert("Please provide a valid credential URI");
          shareCredUriElem.focus();
          return;
        }
        if (verifierId === "") { // TODO - Add condition for validating proper URI format
          alert("Please provide a valid verifier ID");
          verifierIdElem.focus();
          return;
        }

        // Fetch credential
        var shareCred = await util.genericFetch(shareCredUri);

        // Convert credential to N3;
        // TODO - Notify user if credential cannot be parsed properly
        // As constructed, credential is assumed to be of type N3

        // Share credential
        var verifierInbox = await util.discoverInbox(verifierId);
        util.postOptions.headers[util.contentTypeField] = util.contentTypeN3;
        util.postOptions.body = shareCred;
        util.fetcher.load(verifierInbox, util.postOptions);

        // Clear input fields
        shareCredUriElem.val("");
        verifierIdElem.val("");
    },

    // Submit request for credential
    requestCredential: async function(event) {
        event.preventDefault();
        await util.trackSession();

        // Retrieve relevant request elements
        var credDomainElem = $('#cred-domain');
        var credTitleElem = $('#cred-title');
        var credDescElem = $('#cred-desc');
        var issuerIdElem = $('#issuer-id');
        var credDomain = credDomainElem.val();
        var credTitle = credTitleElem.val();
        var credDesc = credDescElem.val();
        var issuerId = issuerIdElem.val();
        var subjectId = util.getMyWebId();
        var messageType = 'REQUEST';

        // Validate inputs
        if (credDomain === "") {
          alert("Please select a valid domain for the credential\n\nWe recommend careful thought for input, as it helps issuers process your eligibility\n\nIf you are unsure what to select, select General");
          credDomainElem.focus();
          return;
        }
        if (credTitle === "") {
          credTitle = `${credDomain} Credential Request for Subject with ID '${subjectId}'`;
        }
        if (issuerId === "") { // TODO - Add condition for validating proper URI format
          alert("Please provide a valid issuer ID");
          issuerIdElem.focus();
          return;
        }
        if (credDesc === "") {
          credDesc = `Hello there! I am requesting issuer with ID '${issuerId}' to grant subject with ID '${subjectId}' a credential of type ${credDomain}`;
        }

        // Discover issuer's inbox location
        console.log("ISSUER ID:", issuerId);
        var issuerInbox = await util.discoverInbox(issuerId);
        console.log("INBOX:", issuerInbox);

        // Add request statements to graph
        var ME = $rdf.Namespace($rdf.uri.docpart(subjectId) + '#');
        var request = ME('request');
        var requestStore = $rdf.graph();
        requestStore.add(request, RDF('type'), SVC('Credential'));
        requestStore.add(request, SVC('domain'), $rdf.Literal.fromValue(credDomain));
        requestStore.add(request, SVC('title'), $rdf.Literal.fromValue(credTitle));
        requestStore.add(request, SVC('description'), $rdf.Literal.fromValue(credDesc));
        requestStore.add(request, SVC('subjectId'), $rdf.Literal.fromValue(subjectId));
        requestStore.add(request, SVC('issuerId'), $rdf.Literal.fromValue(issuerId));
        requestStore.add(request, SVC('messageType'), $rdf.Literal.fromValue(messageType));

        // Sign credential request
        // TODO - util.signDocument()
        var requestJsonLdStr = await util.serialize(null, requestStore, subjectId, util.contentTypeJsonLd);
        var requestJsonLd = JSON.parse(requestJsonLdStr)[0];
        var requestSignedJsonLd = await util.signDocument(requestJsonLd);
        var requestSignedJsonLdStr = JSON.stringify(requestSignedJsonLd, null, 4);
        console.log(`requestSignedJsonLdStr: ${requestSignedJsonLdStr}`);

        /*// Serialize credential request to N3
        var requestBase = request.value;
        var requestN3 = await util.serialize(null, requestStore, requestBase, util.contentTypeN3);*/

        // Submit credential request; TODO - Add logic to inform user of network error (ie. inexistent URI, timeout, etc.)
        // util.postOptions.headers[util.contentTypeField] = util.contentTypeN3;
        // util.postOptions.body = requestN3;
        util.postOptions.headers[util.contentTypeField] = util.contentTypePlain;
        util.postOptions.body = requestSignedJsonLdStr;
        util.fetcher.load(issuerInbox, util.postOptions);

        // Clear input fields
        credDomainElem.val("");
        credTitleElem.val("");
        credDescElem.val("");
        issuerIdElem.val("");
    }
    //// END APP ////
};

$(window).on('load', SolidSub.init);
module.exports = SolidSub;
