const $auth_cli = require('solid-auth-cli');

$auth_cli.login({idp: process.env.SOLID_ACCOUNT, username: process.env.SOLID_UNAME, password: process.env.SOLID_PASS}).then((session) => {
    $auth_cli.fetch("https://kezike.solid.community/inbox/c99155f0-1374-11e9-a29e-5d8e3e616ac9.txt").then((resp) => {
        return resp.text();
    }).then((respText) => {
       console.log(respText)
    });
});
