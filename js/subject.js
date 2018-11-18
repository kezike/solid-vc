// Solid Verifiable Credentials Subject

// Libraries and dependencies
var $n3 = require('n3');
var $rdf = require('rdflib');
var $auth = require('solid-auth-client');
// var app = require('./app');
var util = require('./util');

// Global variables
var provider = 'https://kezike.solid.community/';
var myWebId = provider + 'profile/card#me';
var homeURI = 'http://localhost:8080/';
var popupURI = homeURI + 'popup.html';
var headOptions = {
  method: 'HEAD'/*,
  clearPreviousData: true*/
};
var getOptions = {
  method: 'GET',
  mode: 'cors',
  credentials: 'include'/*,
  clearPreviousData: true*/
};
var postOptions = {
  method: 'POST',
  headers: {
    'content-type': 'text/plain'
  },
  mode: 'cors',
  credentials: 'include',
  /*body: "@prefix : <#>.\n@prefix c: <https://kezike17/solidtest.space/profile/card#>.\n@prefix n0: <http://xmlns.com/foaf/0.1/>.\n@prefix     c0: <https://www.w3.org/People/Berners-Lee/card#>.\nc:me n0:knows c0:i.",*/
  body: "Testing out inbox discovery..."
};

// RDF Namespaces
var LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');

var SolidSub = SolidSub || {};

SolidSub = {
    // fetcher: {},

    // Initialize app
    init: function(event) {
        // SolidSub.generateKeyPair({keyType: 'RSA', bits: 2048, workers: 2});
        SolidSub.bindEvents();
    },

    // Bind events
    bindEvents: function() {
        $(document).on('click', '#req-cred', SolidSub.requestCredential);
    },
    
    // Bind val to key
    bindKeyValue: function(key, val) {
        SolidSub[key] = val;
    },
    
    // Submit request for credential
    requestCredential: function(event) {
        event.preventDefault();
        var issuer = $('#select-issuer').val();
        console.log('ISSUER ID:');
        console.log(issuer);
        var inbox;
        /*var inboxExt = SolidSub.fetcher.store.any(undefined, LDP('inbox'), undefined, $rdf.sym(issuer));
        // var inboxExt = '/inbox';
        console.log('INBOX EXT:');
        console.log(inboxExt);
        var inbox = $rdf.uri.join(inboxExt, issuer);
        console.log('ISSUER INBOX:');
        console.log(inbox);*/
        SolidSub.fetcher.load(issuer, getOptions).then((response) => {
            console.log('STORE:');
            console.log(SolidSub.fetcher.store);
            /*var inboxExt = SolidSub.fetcher.store.anyStatementMatching(undefined, LDP('inbox'), undefined, $rdf.sym(issuer));
            console.log('INBOX EXT:');
            console.log(inboxExt);*/
            SolidSub.fetcher.store.statements.forEach((statement) => {
                if (statement.predicate.value == LDP('inbox').value) {
                  console.log('INBOX:');
                  console.log(statement);
                  inbox = statement.object.value;
                  SolidSub.fetcher.load(inbox, postOptions);
                  return;
                }
            });
            // var inbox = $rdf.uri.join(inboxExt, issuer);
            // console.log('ISSUER INBOX:');
            // console.log(inbox);
        }).catch((err) => {
           console.error(err.name + ": " + err.message);
        });
    }
};

$(window).on('load', SolidSub.init);
module.exports = SolidSub;
