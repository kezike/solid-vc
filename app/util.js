// Solid Verifiable Credentials Utility Library

// Libraries and dependencies
var $rdf = require('rdflib');
var $auth = require('solid-auth-client');
var LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');
// var fs = require('fs');

var SolidUtil = SolidUtil || {};

SolidUtil = {
    headOptions: {
      method: 'HEAD'/*,
      clearPreviousData: true*/
    },

    getOptions: {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      clearPreviousData: true
    },

    postOptions: {
      method: 'POST',
      headers: {
        'content-type': 'text/plain'
      },
      mode: 'cors',
      credentials: 'include',
      /*body: "@prefix : <#>.\n@prefix c: <https://kezike17/solidtest.space/profile/card#>.\n@prefix n0: <http://xmlns.com/foaf/0.1/>.\n@prefix     c0: <https://www.w3.org/People/Berners-Lee/card#>.\nc:me n0:knows c0:i.",*/
      body: "Testing out inbox discovery..."
    },

    pubKeyType: 'PUB',

    privKeyType: 'PRIV',

    pubKeyPemFile: '../auth/pub.pem',

    privKeyPemFile: '../auth/priv.pem',

    // Home page of SolidVC app
    homePage: '/',

    // Bind val to key in obj
    bindKeyValue: function(obj, key, val) {
        obj[key] = val;
    },

    // Login as a different user
    switchAccounts: function(event) {
        /*SolidVC.logout().then(() => {
            SolidVC.login();
        });*/
        console.log("Switching Accounts...")
    },

    // Change role in Verifiable Credentials ecosystem
    switchRoles: function(event) {
        console.log("Switching Roles...")
        window.location.href = SolidUtil.homePage;
    },

    getInbox: function(target) {
        SolidUtil.fetcher.load(target, SolidUtil.getOptions).then((resp) => {
            // var inbox = SolidUtil.fetcher.store.any(undefined, LDP('inbox'), undefined, $rdf.sym(target));
            var inbox;
            SolidUtil.fetcher.store.statements.forEach((statement) => {
                if (statement.predicate.value == LDP('inbox').value) {
                  // console.log('INBOX:');
                  // console.log(statement);
                  inbox = statement.object.value;
                  return;
                }
            });
            return inbox;
            // var inbox = $rdf.uri.join(inboxExt, target);
            // console.log('ISSUER INBOX:');
            // console.log(inbox);
        }).catch((err) => {
           console.error(err.name + ": " + err.message);
           return null;
        });
    },
    
    readFile: function (file, keyType) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
              if (rawFile.status === 200 || rawFile.status == 0) {
                var content = rawFile.responseText;
                switch (keyType) {
                  case SolidUtil.pubKeyType:
                    SolidUtil.pubKey = content;
                  case SolidUtil.privKeyType:
                    SolidUtil.privKey = content;
                }
              }
            }
        }
        rawFile.send(null);
    },

    getPubKey: function() {
        /*fs.readFile(SolidUtil.pubKeyPemFile, 'utf8', function(err, content) {
            console.log(content);
            return content;
        });*/
        SolidUtil.readFile(SolidUtil.pubKeyPemFile, SolidUtil.pubKeyType);
        var pubKey = SolidUtil.pubKey;
        SolidUtil.pubKey = "";
        return pubKey;
    },

    getPrivKey: function() {
        /*fs.readFile(SolidUtil.privKeyPemFile, 'utf8', function(err, content) {
            console.log(content);
            return content;
        });*/
        SolidUtil.readFile(SolidUtil.privKeyPemFile, SolidUtil.privKeyType);
        var privKey = SolidUtil.privKey;
        SolidUtil.privKey = "";
        return privKey;
    }
};

module.exports = SolidUtil;
