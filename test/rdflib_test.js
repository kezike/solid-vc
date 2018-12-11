var $rdf = require('rdflib');
var auth = require('solid-auth-client');
// var store = $rdf.graph();
// var timeout = 5000;
var idp = 'https://kezike.solid.community/';
var webId = idp + 'profile/card#me';
var pub = idp + 'public/';
var inbox = idp + 'inbox/';
// var webId = 'https://kezike17.solidtest.space/profile/card#me';
// var fetcher = new $rdf.Fetcher($rdf.graph();, 5000);
var fetcher = $rdf.fetcher($rdf.graph());
var updateManager = new $rdf.UpdateManager(fetcher.store);
var canonicalizer = require('rdf-canonize');
var loginOptions = {
  username: 'kezike',
  password: 'K@yodellesolid2040'
};
var getOptions = {
  method: 'GET',
  mode: 'cors',
  credentials: 'include',
  clearPreviousData: true
};
var postOptions = {
  method: 'POST',
  headers: {
    'content-type': 'text/n3'
  },
  mode: 'cors',
  credentials: 'include',
  body: "@prefix : <#>.\n@prefix c: <https://kezike17/solidtest.space/profile/card#>.\n@prefix n0: <http://xmlns.com/foaf/0.1/>.\n@prefix     c0: <https://www.w3.org/People/Berners-Lee/card#>.\nc:me n0:knows c0:i."
};

var META = $rdf.Namespace('https://kezike17.solidtest.space/public/svc/meta-gen.n3#');
var FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
var SVC = $rdf.Namespace('http://dig.csail.mit.edu/2018/svc#');
var LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');

function login(idp, options) {
    auth.login(idp, options).then((response) => {
        console.log("SUCCESSFULLY LOGGED IN!");
    });
}

function loadPromise(uri, options) {
    return fetcher.load(uri, options);
}

function load(uri, options) {
    fetcher.load(uri, options).then((response) => {
        var store = fetcher.store;
        var statements = store.statements;
        var statementsMin = [];
        console.log(statements);
        console.log(response);
    });
}

function patch(uri, options) {
    fetcher.load(uri, options).then((response) => {
        var deletions = fetcher.store.match(META('ledger'), SVC('locked'), $rdf.Literal.fromValue(0))[0];
        console.log('deletions:', deletions);
        var insertions = $rdf.triple(META('ledger'), SVC('locked'), $rdf.Literal.fromValue(1));
        updateManager.update(deletions, insertions, (uri, success, error) => {
            console.log('uri:', uri);
            console.log('success:', success);
            console.log('error:', error);
        });
    });
}

function createContainer(parentURI, folderName, data) {
    fetcher.createContainer(parentURI, folderName, data);
}

function getInbox(webId) {
    loadPromise(webId, getOptions).then((response) => {
        var inbox = fetcher.store.any(undefined, LDP('inbox'), undefined, $rdf.sym(webId));
        // console.log("MY INBOX:");
        // console.log(inbox);
        var name = fetcher.store.any(undefined, FOAF('name'), undefined, $rdf.sym(webId));
        console.log(name);
    });
}

// loadProfile('https://kezike17.solidtest.space/public/meta.n3');

/*patch('https://kezike17.solidtest.space/public/svc/meta-gen.n3', getOptions);*/

// createContainer('https://kezike17.solidtest.space/public', 'dweep', "@prefix : <#>.\n@prefix c: <https://kezike17/solidtest.space/profile/card#>.\n@prefix n0: <http://xmlns.com/foaf/0.1/>.\n@prefix c0: <https://www.w3.org/People/Berners-Lee/card#>.\nc:me n0:knows c0:i.");

// login(idp, loginOptions);
// load(pub, getOptions);
getInbox(webId);
