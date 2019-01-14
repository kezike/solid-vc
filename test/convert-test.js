var $rdf = require('rdflib');
var fs = require('fs');

function convertN3ToJsonLD(n3Str) {
    $rdf.convert.convertToJson(n3Str, (err, jsonStr) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("N3 String:");
        console.log(n3Str);
        console.log("JSON Object:");
        console.log(JSON.parse(jsonStr)[0]);
    });
}

var testN3File = "test_cred.n3";
var testN3Str = fs.readFileSync(testN3File, 'utf8');
convertN3ToJsonLD(testN3Str);
