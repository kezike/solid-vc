// Shell-Node API for various json actions

// Required dependencies
const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');

// JSON data
var jsonFile = "";
var jsonStr = "";
var jsonObj = {};

// Discover json file
if (args.json) {
  jsonFile = args.json;
}

// Read field from json file
if (args.read) {
  jsonStr = fs.readFileSync(jsonFile, 'utf8');
  jsonObj = JSON.parse(jsonStr);
  var key = args.key;
  var value = jsonObj[key];
  console.log(value);
}

// Write field to json file
if (args.write) {
  jsonStr = fs.readFileSync(jsonFile, 'utf8');
  jsonObj = JSON.parse(jsonStr);
  var key = args.key;
  var value = args.value;
  jsonObj[key] = value;
  fs.writeFileSync(jsonFile, JSON.stringify(jsonObj, null, 4) , 'utf-8');
}

// Delete field from json file
if (args.delete) {
  jsonStr = fs.readFileSync(jsonFile, 'utf8');
  jsonObj = JSON.parse(jsonStr);
  var key = args.key;
  delete jsonObj[key]
  fs.writeFileSync(jsonFile, JSON.stringify(jsonObj, null, 4) , 'utf-8');
}

