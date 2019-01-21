// Solid Verifiable Credentials Inspector

// Libraries and dependencies
var util = require('./util.js');

var SolidVer = SolidVer || {};

SolidVer = {
    //// BEGIN APP ////
    // Initialize app
    init: function(event) {
        SolidVer.bindEvents();
        SolidVer.refreshVerificationElements();
    },

    // Bind events
    bindEvents: function() {
        $(document).on('click', '#verify-cred', SolidVer.verifyCredential);
        $(document).on('click', '#switch-acct', util.switchAccounts);
        $(document).on('click', '#switch-role', util.switchRoles);
    },

    // Refresh verification feedback elements
    refreshVerificationElements: function() {
        var verifySuccessImg = $("#verifiy-success-img");
        var verifySuccessRes = $("#verifiy-success-res");
        var verifyErrorImg = $("#verifiy-error-img");
        var verifyErrorRes = $("#verifiy-error-res");
        verifySuccessImg.addClass('hidden');
        verifySuccessRes.addClass('hidden');
        verifyErrorImg.addClass('hidden');
        verifyErrorRes.addClass('hidden');
    },

    // Verify credential has proper signature
    verifyCredential: async function(event) {
        event.preventDefault();
        await util.trackSession();
        SolidVer.refreshVerificationElements();

        // Retrieve relevant verification elements
        var verifyCredUriElem = $('#verify-cred-uri');
        var verifyCredUri = verifyCredUriElem.val();
        var verifySuccessImg = $("#verifiy-success-img");
        var verifySuccessRes = $("#verifiy-success-res");
        var verifyErrorImg = $("#verifiy-error-img");
        var verifyErrorRes = $("#verifiy-error-res");

        // Verify credential and display appropriate feedback
        var verifyResult = await util.verifyDocument(verifyCredUri);
        if (verifyResult.verified) {
          verifySuccessRes.text(JSON.stringify(verifyResult));
          verifySuccessImg.removeClass('hidden');
          verifySuccessRes.removeClass('hidden');
          console.log(`Signature verified: ${verifyResult.verified}`);
        } else {
          verifyErrorRes.text(JSON.stringify(verifyResult));
          verifyErrorImg.removeClass('hidden');
          verifyErrorRes.removeClass('hidden');
          console.log(`Signature verification error:\n${verifyResult.error}`);
        }
    }
    //// END APP ////
};

$(window).on('load', SolidVer.init);
module.exports = SolidVer;
