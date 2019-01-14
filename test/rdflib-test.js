var $rdf = require('rdflib');
var $auth = require('solid-auth-client');
var $auth_cli = require('solid-auth-cli');
// var store = $rdf.graph();
// var timeout = 5000;
var idp = 'https://kezike.solid.community/';
var webId = idp + 'profile/card#me';
var pub = idp + 'public/';
var inbox = idp + 'inbox/';
var me = $rdf.sym(webId);
var popupURI = 'popup.html';
// var webId = 'https://kezike17.solidtest.space/profile/card#me';
// var fetcher = new $rdf.Fetcher($rdf.graph();, 5000);
var fetcher = $rdf.fetcher($rdf.graph());
var updateManager = new $rdf.UpdateManager(fetcher.store);
// var canonicalizer = require('rdf-canonize');

var META = $rdf.Namespace('https://kezike17.solidtest.space/public/svc/meta-gen.n3#');
var FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
var SVC = $rdf.Namespace('http://dig.csail.mit.edu/2018/svc#');
var SEC = $rdf.Namespace('https://w3id.org/security#');
var LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');

var RdflibPg = RdflibPg || {};

RdflibPg = {
    loginOptions: {
      username: 'kezike',
      password: ''
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
        'content-type': 'text/n3'
      },
      mode: 'cors',
      credentials: 'include',
      body: "@prefix : <#>.\n@prefix c: <https://kezike17/solidtest.space/profile/card#>.\n@prefix n0: <http://xmlns.com/foaf/0.1/>.\n@prefix     c0: <https://www.w3.org/People/Berners-Lee/card#>.\nc:me n0:knows c0:i."
    },

    patchOptions: {
      method: 'PATCH',
      headers: {
        'content-type': 'text/n3'
      },
      mode: 'cors',
      credentials: 'include',
      deletions: [],
      insertions: []
    },

    // Initialize app
    init: function(event) {
        /*RdflibPg.bindEvents();
        RdflibPg.login();*/
        $auth_cli.login({idp: process.env.SOLID_ACCOUNT, username: process.env.SOLID_UNAME, password: process.env.SOLID_PASS}).then((session) => {
            $auth_cli.fetch("https://kezike.solid.community/inbox/c99155f0-1374-11e9-a29e-5d8e3e616ac9.txt").then((resp) => {
                return resp.text();
            }).then((respText) => {
               console.log(respText)
            });
        });
    },

    // Login helper function
    loginHelper: function(session) {
        RdflibPg.session = session;
        console.log("currentSession:", RdflibPg.session);
        RdflibPg.fetcher = $rdf.fetcher($rdf.graph());
        console.log("RdflibPg.fetcher:", RdflibPg.fetcher);
        RdflibPg.updater = new $rdf.UpdateManager(RdflibPg.fetcher.store);
    },

    // Login to app
    login: function() {
        $auth.currentSession().then((currentSession) => {
            if (!currentSession) {
              $auth.popupLogin({popupUri: popupURI}).then((popupSession) => {
                  RdflibPg.loginHelper(popupSession);
              }).catch((err) => {
                 console.error(err.name + ": " + err.message);
              });
              return;
            }
            RdflibPg.loginHelper(currentSession);
        }).catch((err) => {
           console.error(err.name + ": " + err.message);
        });
    },

    // Bind events
    bindEvents: function() {
        // $(document).on('click', '#load-inbox', RdflibPg.loadInbox);
    },

    load: function(uri, options) {
        fetcher.load(uri, options).then((response) => {
            var store = fetcher.store;
            var statements = store.statements;
            var statementsMin = [];
            console.log(statements);
            console.log(response);
        });
    },

    patch: function(uri, options) {
        fetcher.load(uri, options).then((response) => {
            // var deletions = fetcher.store.match(META('ledger'), SVC('locked'), $rdf.Literal.fromValue(0))[0];
            // console.log('deletions:', deletions);
            // var insertions = $rdf.triple(META('ledger'), SVC('locked'), $rdf.Literal.fromValue(1));
            updateManager.update(options.deletions, options.insertions, (uri, success, error) => {
                console.log('uri:', uri);
                console.log('success:', success);
                console.log('error:', error);
            });
        });
    },

    createContainer: function(parentURI, folderName, data) {
        fetcher.createContainer(parentURI, folderName, data);
    },

    // Discover the inbox of a target via LDN
    discoverInbox: async function(target) {
        var inboxPromise = new Promise((resolve, reject) => {
            RdflibPg.fetcher.load(target, RdflibPg.getOptions).then((resp) => {
                var inbox = RdflibPg.fetcher.store.any($rdf.sym(target), LDP('inbox'), undefined);
                resolve(inbox);
            }).catch((err) => {
               console.error(err.name + ": " + err.message);
               resolve(null);
            });
        });
        var inboxResult = await inboxPromise;
        return inboxResult;
    },

    // Load content of inbox
    loadInbox: async function(inbox) {
        var inboxPromise = new Promise((resolve, reject) => {
            RdflibPg.fetcher.load(inbox, RdflibPg.getOptions).then((resp) => {
                // resolve(resp);
                resolve(resp['responseText']);
                // var inboxContent = RdflibPg.fetcher.store.any($rdf.sym(inbox), LDP('contains'), undefined);
                // resolve(inboxContent);
            }).catch((err) => {
               console.error(err.name + ": " + err.message);
               resolve(null);
            });
        });
        var inboxResult = await inboxPromise;
        return inboxResult;
    },

    parseCredential: function(event) {
        event.preventDefault();
        var vc = $("#vc").val();
        var store = $rdf.graph();
        var base = me.value;
        var type = "text/n3";
        // var prefixPattern = /(@prefix (\w|\d)*: <.*>\.(\r|\n)*)*/;
        // var prefixResult = prefixPattern.exec(vc);
        // console.log("prefixes:\n", prefixResult);
        // var prefixes = prefixResult[0];
        // var body = vc.split(prefixes)[1];
        // console.log("prefixes:\n" + prefixes);
        // console.log("body:\n" + body);
        $rdf.parse(vc, store, base, type, (errParse, resParse) => {
            if (errParse) {
              // console.error(errParse.name + ": " + errParse.message);
              console.log("errParse:\n", errParse);
              return;
            }
            console.log("resParse:\n", resParse);
            $rdf.serialize(null, resParse, base, type, /*null*/ (errSer, resSer) => {
                if (errSer) {
                  console.error(errSer.name + ": " + errSer.message);
                  return;
                }
                console.log("resSer:\n", resSer);
            }, {});
            /*var stmts = res.statements;
            for (var i=0; i < stmts.length; i++) {
              var stmt = stmts[i];
              var sub = stmt.subject.value;
              var pred = stmt.predicate.value;
              var obj = stmt.object.value;
              console.log(sub, pred, obj);
            }
            console.log("res:\n", res);*/
        });
    }
}

async function main() {
    // Main Program Setup
    RdflibPg.init();
    // LDN Test
    var inbox = await RdflibPg.discoverInbox(webId);
    var inboxContent = await RdflibPg.loadInbox(inbox);
    console.log("Inbox:\n" + inbox);
    console.log("Inbox Content:\n" + inboxContent);
    // Patch Test
    var me = $rdf.sym('https://kezike.solid.community/profile/card#me');
    var doc = me.doc();
    patchOptions.insertions.push($rdf.st(me, SEC('publicKey'), $rdf.Literal.fromValue('https://kezike.solid.community/public/keys/0516d000-1532-11e9-a29e-5d8e3e616ac9.txt'), doc));
    RdflibPg.patch('https://kezike.solid.community/profile/card', patchOptions);
    // Create Container Test
    // RdflibPg.createContainer('https://kezike17.solidtest.space/public', 'dweep', "@prefix : <#>.\n@prefix c: <https://kezike17/solidtest.space/profile/card#>.\n@prefix n0: <http://xmlns.com/foaf/0.1/>.\n@prefix c0: <https://www.w3.org/People/Berners-Lee/card#>.\nc:me n0:knows c0:i.");
    // Load Test
    // RdflibPg.load(pub, getOptions);
}

// $(window).on('load', RdflibPg.init);
main();
