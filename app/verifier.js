// Solid Verifiable Credentials Inspector

// Libraries and dependencies
var util = require('./util.js');

var SolidVer = SolidVer || {};

SolidVer = {
    //// BEGIN APP ////
    // Initialize app
    init: function(event) {
        SolidVer.bindEvents();
    },

    // Bind events
    bindEvents: function() {
        $(document).on('click', '#verify-cred', SolidVer.verifyCredential);
        $(document).on('click', '#switch-acct', util.switchAccounts);
        $(document).on('click', '#switch-role', util.switchRoles);
    },

    // Verify credential has proper signature
    verifyCredential: function(event) {
    }
    //// END APP ////
};

$(window).on('load', SolidVer.init);
module.exports = SolidVer;
