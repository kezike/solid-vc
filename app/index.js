// Solid Verifiable Credentials Application

// Libraries and dependencies
// var $auth = require('solid-auth-client');
var $rdf = require('rdflib');
var util = require('./util.js');
var subject = require('./subject.js');
var issuer = require('./issuer.js');
var verifier = require('./verifier.js');

var popupUri = 'popup.html';

var SolidVC = SolidVC || {};

SolidVC = {
    // Initialize app
    init: async function(event) {
        SolidVC.bindEvents();
        // SolidVC.login();
        await util.login();
    },

    // Bind events
    bindEvents: function() {
        // $(document).on('change', '#signature', SolidVC.handleSignatureUpload);
        // $(document).on('change', '#creator', SolidVC.handleCreatorUpload);
        // $(document).on('click', '#issue-cred', SolidVC.issueCredential);
        // $(document).on('click', '#switch-acct, SolidVC.switchAccounts);
        $(document).on('click', '#subject-role', util.loadSubject);
        $(document).on('click', '#issuer-role', util.loadIssuer);
        $(document).on('click', '#verifier-role', util.loadVerifier);
        $(document).on('click', '#nav-inbox', util.loadInbox);
        $(document).on('click', '#switch-acct', util.switchAccounts);
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

    /*// Login helper function
    loginHelper: async function(session) {
        SolidVC.session = session;
        console.log("SolidVC.session:", SolidVC.session);
        SolidVC.fetcher = $rdf.fetcher($rdf.graph());
        console.log("SolidVC.fetcher:", SolidVC.fetcher);
        // SolidVC.updater = new $rdf.UpdateManager(SolidVC.fetcher.store);
        // util.bindKeyValue(util, 'THIS', $rdf.Namespace($rdf.uri.docpart(SolidVC.session.webId) + '#'));
        var inbox = await util.discoverInbox(util.getMyWebId());
        util.bindKeyValue(util, util.ldpInboxField, inbox);
        util.bindKeyValue(util, 'session', SolidVC.session);
        util.bindKeyValue(util, 'fetcher', SolidVC.fetcher);
        util.bindKeyValue(subject, 'session', SolidVC.session);
        util.bindKeyValue(subject, 'fetcher', SolidVC.fetcher);
        util.bindKeyValue(issuer, 'session', SolidVC.session);
        util.bindKeyValue(issuer, 'fetcher', SolidVC.fetcher);
        util.bindKeyValue(verifier, 'session', SolidVC.session);
        util.bindKeyValue(verifier, 'fetcher', SolidVC.fetcher);
    },

    // Login to app
    login: function() {
        $auth.currentSession().then(async (currentSession) => {
            if (!currentSession) {
              $auth.popupLogin({popupUri: popupUri}).then(async (popupSession) => {
                  await SolidVC.loginHelper(popupSession);
              }).catch((err) => {
                 console.error(err.name + ": " + err.message);
              });
              return;
            }
            await SolidVC.loginHelper(currentSession);
        }).catch((err) => {
           console.error(err.name + ": " + err.message);
        });
    },

    logout: function() {
        // localStorage.removeItem("solid-auth-client");
        // localStorage.clear();
        return $auth.logout();
    }*/
};

$(window).on('load', SolidVC.init);
module.exports = SolidVC;
