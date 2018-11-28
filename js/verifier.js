// Solid Verifiable Credentials Inspector

// Libraries and dependencies
var util = require('./util.js');

var SolidVer = SolidVer || {};

SolidVer = {
    // Initialize app
    init: function(event) {
        SolidVer.bindEvents();
    },

    // Bind events
    bindEvents: function() {
        $(document).on('click', '#switch-acct', util.switchAccounts);
        $(document).on('click', '#switch-role', util.switchRoles);
    }
};

$(window).on('load', SolidVer.init);
module.exports = SolidVer;
