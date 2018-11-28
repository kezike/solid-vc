// Solid Verifiable Credentials Application

// Libraries and dependencies
var $n3 = require('n3');
var $rdf = require('rdflib');
var $auth = require('solid-auth-client');
var util = require('./util.js');
var subject = require('./subject.js');
var issuer = require('./issuer.js');
var verifier = require('./verifier.js');

// Global variables
var homeURI = 'http://localhost:8080/';
var popupURI = homeURI + 'popup.html';

var SolidVC = SolidVC || {};

SolidVC = {
    // Initialize app
    init: function(event) {
        SolidVC.bindEvents();
        // SolidVC.addPrefixes();
        // SolidVC.displayStatements();
        /*svcSession = window.session;
        svcFetch = window.fetch;
        SolidVC.fetcher = $rdf.fetcher($rdf.graph(), {fetch: svcFetch});
        console.log("svcSession:\n", svcSession);
        console.log("SolidVC.fetcher._fetch:\n", SolidVC.fetcher._fetch);*/
        console.log('$auth.fetch:', $auth.fetch);
        SolidVC.login();
    },

    // Load subject page
    loadSubject: function(event) {
        // SolidVC.login();
        SolidVC.role = 'subject';
        SolidVC.webPage = SolidVC.role + '.html';
        window.location.href = SolidVC.webPage;
        // subject = require('./subject');
    },

    // Load issuer page
    loadIssuer: function(event) {
        // SolidVC.login();
        SolidVC.role = 'issuer';
        SolidVC.webPage = SolidVC.role + '.html';
        window.location.href = SolidVC.webPage;
        // issuer = require('./issuer');
    },

    // Load verifier page
    loadVerifier : function(event) {
        // SolidVC.login();
        SolidVC.role = 'verifier';
        SolidVC.webPage = SolidVC.role + '.html';
        window.location.href = SolidVC.webPage;
        // verifier = require('./verifier');
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

    loginHelper: function(session) {
        SolidVC.session = session;
        console.log("currentSession:", SolidVC.session);
        SolidVC.fetcher = $rdf.fetcher($rdf.graph());
        console.log("SolidVC.fetcher:", SolidVC.fetcher);
        SolidVC.updater = new $rdf.UpdateManager(SolidVC.fetcher.store);
        util.getPubKey();
        util.getPrivKey();
        console.log("CWD:", process.cwd());
        util.bindKeyValue(util, 'session', SolidVC.session);
        util.bindKeyValue(util, 'fetcher', SolidVC.fetcher);
        util.bindKeyValue(subject, 'session', SolidVC.session);
        util.bindKeyValue(subject, 'fetcher', SolidVC.fetcher);
        util.bindKeyValue(issuer, 'session', SolidVC.session);
        util.bindKeyValue(issuer, 'fetcher', SolidVC.fetcher);
        console.log("ISSUER FETCHER:", issuer.fetcher);
        util.bindKeyValue(verifier, 'session', SolidVC.session);
        util.bindKeyValue(verifier, 'fetcher', SolidVC.fetcher);
    },

    // Login to app
    login: function() {
        $auth.currentSession().then((currentSession) => {
            if (!currentSession) {
              $auth.popupLogin({popupUri: popupURI}).then((popupSession) => {
                  SolidVC.loginHelper(popupSession);
              }).catch((err) => {
                 console.error(err.name + ": " + err.message);
              });
              return;
            }
            SolidVC.loginHelper(currentSession);
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
        // $(document).on('click', '#issue-cred', SolidVC.issueCredential);
        // $(document).on('click', '#patch-meta', SolidVC.patchMetaFile);
        // $(document).on('click', '#switch-acct, SolidVC.switchAccounts);
        $(document).on('click', '#subject-role', SolidVC.loadSubject);
        $(document).on('click', '#issuer-role', SolidVC.loadIssuer);
        $(document).on('click', '#verifier-role', SolidVC.loadVerifier);
    },

    logout: function() {
        // localStorage.removeItem("solid-auth-client");
        // localStorage.clear();
        return $auth.logout();
    },
};

$(window).on('load', SolidVC.init);
module.exports = SolidVC;
