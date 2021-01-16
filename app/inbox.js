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
var SolidInbox = SolidInbox || {};

SolidInbox = {
    //// BEGIN APP ////
    // Message element info
    messageInfo: [], // has fields 'uri', 'inspectId', 'verifyId', 'downloadId'

    // Action element id delimiter
    actionElemIdDelim: '-',
    
    // Initialize app
    init: async function(event) {
        SolidInbox.bindEvents();
        // $(SolidInbox.issueTabLink).click();
        // SolidInbox.generateKeyPair({keyType: 'RSA', bits: 2048, workers: 2});
    },

    // Bind events
    bindEvents: function() {
        $(document).on('click', '.inspect-cred', SolidInbox.inspectCredential);
        $(document).on('click', '.download-msg', SolidInbox.downloadMessage);
        $(document).on('click', '#nav-home', util.navigateHome);
        $(document).on('click', '#nav-subject', util.loadSubject);
        $(document).on('click', '#nav-issuer', util.loadIssuer);
        $(document).on('click', '#nav-verifier', util.loadVerifier);
        $(document).on('click', '#inbox', util.loadInbox);
        $(document).on('click', '#switch-acct', util.switchAccounts);
        /*// Close credential inpection modal when button pressed
        $(messageModal).on('click', closeButtonId, () => {
            messageModal.css("display","none");
        });
        
        // Close credential inpection modal when click scope is out of modal bounds
        $(window).on('click', (event) => {
            if (event.target == messageModal) {
              messageModal.css("display","none");
            }
        });*/
    },

    /*// Display tab
    displayTab: async function(event) {
        console.log("event.target.id:", $(event.target).attr('id'));

        // Get all elements with class="tabcontent" and hide them
        $('.tabcontent').css('display', 'none');

        // Get all elements with class="tablinks" and remove the class "active"
        $('.tablinks').removeClass('active');

        // Show the current tab, and add an "active" class to the button that opened the tab
        switch('#' + $(event.target).attr('id')) {
          case SolidInbox.reviewTabLink:
            SolidInbox.currentTabLink = SolidInbox.reviewTabLink;
            SolidInbox.currentTabCnt = SolidInbox.reviewTabCnt;
            $(SolidInbox.currentTabCnt).css('display', 'block');
            $(event.currentTarget).addClass('active');
            await SolidInbox.loadReviewTab();
            break;
        }
    },*/
    //// END APP ////
};

$(window).on('load', SolidInbox.init);
module.exports = SolidInbox;
