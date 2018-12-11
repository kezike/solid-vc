// Solid Verifiable Credentials Subject

// Libraries and dependencies
var $n3 = require('n3');
var $rdf = require('rdflib');
var $auth = require('solid-auth-client');
var util = require('./util.js');

// Global variables
var provider = 'https://kezike.solid.community/';
var myWebId = provider + 'profile/card#me';
var homeURI = 'http://localhost:8080/';
var popupURI = homeURI + 'popup.html';

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
    requestCredential: function(event) {
        event.preventDefault();
        var inbox;
        var issuerId = $('#issuer-id').val();
        var issuerPubKey = $('#issuer-pubkey').val();
        console.log('ISSUER ID:');
        console.log(issuerId);
        /*var inboxExt = SolidSub.fetcher.store.any(undefined, LDP('inbox'), undefined, $rdf.sym(issuerId));
        // var inboxExt = '/inbox';
        console.log('INBOX EXT:');
        console.log(inboxExt);
        var inbox = $rdf.uri.join(inboxExt, issuerId);
        console.log('ISSUER INBOX:');
        console.log(inbox);*/
        SolidSub.fetcher.load(issuerId, util.getOptions).then((resp) => {
            /*console.log('STORE:');
            console.log(SolidSub.fetcher.store);*/
            /*var inboxExt = SolidSub.fetcher.store.any(undefined, LDP('inbox'), undefined, $rdf.sym(issuerId));
            console.log('INBOX EXT:');
            console.log(inboxExt);*/
            SolidSub.fetcher.store.statements.forEach((statement) => {
                if (statement.predicate.value == LDP('inbox').value) {
                  // console.log('INBOX:');
                  // console.log(statement);
                  inbox = statement.object.value;
                  SolidSub.fetcher.load(inbox, util.postOptions);
                  return;
                }
            });
            // var inbox = $rdf.uri.join(inboxExt, issuerId);
            // console.log('ISSUER INBOX:');
            // console.log(inbox);
        }).catch((err) => {
           console.error(err.name + ": " + err.message);
        });
    }
};

$(window).on('load', SolidSub.init);
module.exports = SolidSub;
