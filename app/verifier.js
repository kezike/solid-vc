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
        $(document).on('click', '#nav-home', util.navigateHome);
        $(document).on('click', '#nav-subject', util.loadSubject);
        $(document).on('click', '#nav-issuer', util.loadIssuer);
        $(document).on('click', '#nav-verifier', util.loadVerifier);
        $(document).on('click', '#nav-inbox', util.loadInbox);
        $(document).on('click', '#switch-acct', util.switchAccounts);
    },

    // Refresh verification feedback elements
    refreshVerificationElements: function() {
        var verifySuccessImg = $("#verifiy-success-img");
        var verifySuccessRes = $("#verifiy-success-res");
        var verifyErrorImg = $("#verifiy-error-img");
        var verifyErrorRes = $("#verifiy-error-res");
        var verifyCredUriElem = $('#verify-cred-uri');
        verifySuccessImg.addClass('hidden');
        verifySuccessRes.addClass('hidden');
        verifyErrorImg.addClass('hidden');
        verifyErrorRes.addClass('hidden');
        verifyCredUriElem.focus();
    },

    // Verify credential has proper signature
    verifyCredential: async function(event) {
        event.preventDefault();
        await util.trackSession();
        SolidVer.refreshVerificationElements();

        // Retrieve relevant verification elements
        var verifySuccessImg = $("#verifiy-success-img");
        var verifySuccessRes = $("#verifiy-success-res");
        var verifyErrorImg = $("#verifiy-error-img");
        var verifyErrorRes = $("#verifiy-error-res");
        var verifyCredUriElem = $('#verify-cred-uri');
        var verifyCredUri = verifyCredUriElem.val();

        // Validate inputs
        if (verifyCredUri === "") {
          alert("Please provide a valid credential URI");
          SolidVer.refreshVerificationElements();
          return;
        }

        // Verify credential and display appropriate feedback
        var verifyResult = await util.verifyDocument(verifyCredUri);
        if (verifyResult.verified) {
          verifySuccessRes.text(JSON.stringify(verifyResult, null, 4));
          verifySuccessImg.removeClass('hidden');
          verifySuccessRes.removeClass('hidden');
          console.log(`Signature verified: ${verifyResult.verified}`);
        } else {
          verifyErrorRes.text(JSON.stringify(verifyResult, null, 4));
          verifyErrorImg.removeClass('hidden');
          verifyErrorRes.removeClass('hidden');
          console.error("Signature verification error:\n");
          console.error(verifyResult.error);
        }

        // Clear input fields
        verifyCredUriElem.val("");
    }
    //// END APP ////
};

$(window).on('load', SolidVer.init);
module.exports = SolidVer;
