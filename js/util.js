// Solid Verifiable Credentials Utility Library

// Libraries and dependencies
var $rdf = require('rdflib');
var auth = require('solid-auth-client');

var SolidUtil = SolidUtil || {};

SolidUtil = {
    // Bind val to key in obj
    bindKeyValue: function(obj, key, val) {
        obj[key] = val;
    }
};

module.exports = SolidUtil;
