var $rdf = require('rdflib');
var fs = require('fs');
var n3File = "sample_claim.n3";
var n3Content;
var jsonContent;

// $rdf.convert.convertToJson("@prefix : <#>.\n@prefix c: <https://kezike17/solidtest.space/profile/card#>.\n@prefix n0: <http://xmlns.com/foaf/0.1/>.\n@prefix c0: <https://www.w3.org/People/Berners-Lee/card#>.\nc:me n0:knows c0:i.", (err, res) => {console.log(res);});
// $rdf.convert.convertToJson("svc.n3", (err, res) => {console.log(res);});
fs.readFile(n3File, 'utf8', function(err, content) {
    n3Content = content;
    $rdf.convert.convertToJson(n3Content, (err, res) => {console.log(JSON.parse(res)[0]);});
});
// setTimeout(()=>{console.log(n3Content)}, 1000);
// $rdf.convert.convertToJson(n3Content, (err, res) => {console.log(res);});
