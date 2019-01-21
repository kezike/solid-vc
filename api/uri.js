const args = require('minimist')(process.argv.slice(2));
const $rdf = require('rdflib');

if (args.host) {
  console.log($rdf.uri.hostpart(args.host));
}

if (args.doc) {
  console.log($rdf.uri.docpart(args.doc));
}
