var $rdf = require('rdflib');
var webId = 'https://kezike.solid.community/profile/card#me';
var fetcher = $rdf.fetcher($rdf.graph());
var LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');
var getOptions = {
  method: 'GET',
  mode: 'cors',
  credentials: 'include'
};

function anyTest(target, options) {
    var inbox;
    fetcher.load(webId, options).then((respFindInbox) => {
        var inbox = fetcher.store.any(undefined, LDP('inbox'), undefined, $rdf.sym(webId));
        console.log('INBOX:', inbox);
    }).catch((err) => {
       console.error(err.name + ": " + err.message);
    });
}

anyTest(webId, getOptions);
