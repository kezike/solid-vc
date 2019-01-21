var $rdf = require('rdflib');
var fs = require('fs');
var webId = "https://kezike.solid.community/profile/card#me";

// Parse raw text of certain type into graph store
async function parse(text, store, base, type) {
    var parsePromise = new Promise((resolve, reject) => {
        $rdf.parse(text, store, base, type, (errParse, resParse) => {
            if (errParse) {
              reject(errParse);
            }
            resolve(resParse);
        });
    });
    var parseResult = await parsePromise;
    return parseResult;
}

// Serialize graph store into raw text of certain type
async function serialize(target, store, base, type) {
    var serializePromise = new Promise((resolve, reject) => {
        $rdf.serialize(target, store, base, type, (errSer, resSer) => {
            if (errSer) {
              resolve(errSer);
            }
            resolve(resSer);
        }, {});
    });
    var serializeResult = await serializePromise;
    return serializeResult;
}

// Test 1: Convert JSON-LD to N3
async function Test1() {
    console.log("BEGIN TEST 1");
    // Parse Text
    var file = "../data/age_1.json";
    var text = fs.readFileSync(file, 'utf8');
    var store = $rdf.graph();
    var base = webId;
    var type = "application/ld+json";
    var parsed = await parse(text, store, base, type);
    console.log("Parsed Graph Store:\n" + parsed);

    // Serialize Graph
    type = "text/n3";
    var target = null;
    var serialized = await serialize(target, parsed, base, type);
    console.log("Serialized Raw Text:\n" + serialized);
    console.log("END TEST 1\n");
}

// Test 2: Convert N3 to JSON-LD
async function Test2() {
    console.log("BEGIN TEST 2");
    // Parse Text
    var file = "../data/homepage.n3";
    var text = fs.readFileSync(file, 'utf8');
    var store = $rdf.graph();
    var base = webId;
    var type = "text/n3";
    var parsed = await parse(text, store, base, type);
    console.log("Parsed Graph Store:\n" + parsed);

    // Serialize Graph
    type = "application/ld+json";
    var target = null;
    var serialized = await serialize(target, parsed, base, type);
    console.log("Serialized Raw Text:\n" + serialized);
    console.log("END TEST 2\n");
}

async function main() {
    await Test1();
    await Test2();
}

main();
