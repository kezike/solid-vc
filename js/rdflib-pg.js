var $rdf = require('rdflib');
var auth = require('solid-auth-client');
// var store = $rdf.graph();
// var timeout = 5000;
var webId = 'https://kezike17.solidtest.space/profile/card#me';
// var fetcher = new $rdf.Fetcher($rdf.graph();, 5000);
var fetcher = new $rdf.Fetcher($rdf.graph(), {fetch: auth.fetch});
var canonicalizer = require('rdf-canonize');

var FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
var SVC = $rdf.Namespace('http://dig.csail.mit.edu/2018/svc#');

function loadProfile(webId) {
    fetcher.nowOrWhenFetched(webId, (ok, body, xhr) => {
        if (!ok) {
          console.log("Oops, something happened and couldn't fetch data");
        } else {
          var statements = fetcher.store.statements;
          /*statements.forEach((statement) => {
              console.log(statement.subject + ' ' + statement.predicate + ' ' + statement.object);
          });*/
          /*try {
           var me = $rdf.sym(webId);
            var name = FOAF('name');
            var myNameObj = fetcher.store.any(me, name);
            var myName = myNameObj.value;
            /*var img = FOAF('img');
            var myImgObj = fetcher.store.any(me, img);
            var myImg = myImgObj.value;*/
            /*var knows = FOAF('knows');
            var myFriends = fetcher.store.each(me, knows);
            console.log('My name:', myName);
            // console.log('My image:', myImg);
            console.log('My friends:');
            for (var i = 0; i < myFriends.length; i++) {
              var friend = myFriends[i];
              console.log(friend.value);
            }
          } catch (err) {
            console.log(err);
          }*/
        }
    });
}

function load(uri, options) {
    fetcher.load(uri, options).then((response) => {
        // console.log(response);
        var store = fetcher.store;
        var statements = store.statements;
        var statementsMin = [];
        // console.log(response);
        // console.log(statements);
        // console.log(store);
        console.log(statements.length);
        statements.forEach((statement) => {
            statementsMin.push({subject: statement.subject, predicate: statement.predicate, object: statement.object, graph: statement.why});
        });
        for (var i = 0; i < statements.length; i++) {
          var statement = statements[i];
          statement.graph = statement.why;
          statements[i] = statement;
        }
        // console.log(statements);
        // console.log(store.toCanonical());
        console.log("LENGTH:", store.match(undefined, SVC('length'), undefined));
        canonicalizer.canonize(statements, {algorithm: 'URDNA2015'}).then((err, canon) => {
            if (err) {
              console.error(err.name + ": " + err.message);
              return;
            }
            console.log("canon:\n" + canon);
        }).catch((err) => {
           console.error(err.name + ": " + err.message);
        });
    });
}

function createContainer(parentURI, folderName, data) {
    fetcher.createContainer(parentURI, folderName, data);
}

// loadProfile('https://kezike17.solidtest.space/public/meta.n3');
load('https://kezike17.solidtest.space/public/meta.n3', {
    method: 'GET',
    mode: 'cors',
    credentials: 'include'
});
// createContainer('https://kezike17.solidtest.space/public', 'dweep', "@prefix : <#>.\n@prefix c: <https://kezike17/solidtest.space/profile/card#>.\n@prefix n0: <http://xmlns.com/foaf/0.1/>.\n@prefix c0: <https://www.w3.org/People/Berners-Lee/card#>.\nc:me n0:knows c0:i.");
