var downloader = require('file-saver');
var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
downloader.saveAs(blob, "hello_world.txt");
// downloader.saveAs("https://httpbin.org/image", "image.jpg");

/*// Download content to local file
async function writeKeyFile(keyFile, data) {
    var keyPromise = new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", keyFile, false);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
              console.log("Ready state has changed");
            }
        }
        xhr.send(data);
    });
    var keyResult = await keyPromise;
    return keyResult;
}

async function main() {
    var writeResult = await writeKeyFile('meep', "MEEEEEEPEPEPEPEPEPEPEPEP!!!");
}

main();*/
