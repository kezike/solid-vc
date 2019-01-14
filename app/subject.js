// Solid Verifiable Credentials Subject

// Libraries and dependencies
var $rdf = require('rdflib');
var util = require('./util.js');

// Global variables
var provider = 'https://kezike.solid.community/';
var myWebId = provider + 'profile/card#me';
var homeUri = 'http://localhost:8080/';
var popupUri = homeUri + 'popup.html';

// RDF Namespaces
var LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');

var SolidSub = SolidSub || {};

SolidSub = {
    // Initialize app
    init: function(event) {
        // SolidSub.generateKeyPair({keyType: 'RSA', bits: 2048, workers: 2});
        SolidSub.bindEvents();
    },

    // Bind events
    bindEvents: function() {
        $(document).on('click', '#req-cred', SolidSub.requestCredential);
        $(document).on('click', '#switch-acct', util.switchAccounts);
        $(document).on('click', '#switch-role', util.switchRoles);
    },

    // Submit request for credential
    requestCredential: async function(event) {
        event.preventDefault();
        var issuerId = $('#issuer-id').val();
        var credPlain = $('#cred-plain').val();
        var issuerInbox = await util.discoverInbox(issuerId);
        console.log("ISSUER ID:", issuerId);
        console.log("INBOX:", issuerInbox);
        util.postOptions.headers[util.contentTypeField] = util.contentTypePlain;
        util.postOptions.body = credPlain;
        // SolidSub.fetcher.load(issuerInbox, util.postOptions);
        util.fetcher.load(issuerInbox, util.postOptions);
    }
};

$(window).on('load', SolidSub.init);
module.exports = SolidSub;
