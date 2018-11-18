// Solid Verifiable Credentials Inspector

var SolidVer = SolidVer || {};

SolidVer = {
    // Initialize app
    init: function(event) {
        SolidVer.bindEvents();
    },

    // Bind events
    bindEvents: function() {
    }
};

$(window).on('load', SolidVer.init);
module.exports = SolidVer;
