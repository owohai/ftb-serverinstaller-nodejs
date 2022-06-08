const {exec} = require("child_process")
const Downloader = require("nodejs-file-downloader");
const fg = require('fast-glob');
const fetch = require("fetch").fetchUrl;
const fs = require("fs");
let base = process.argv.slice(2)

// CLI colors
var clc = require("cli-color");
var error = clc.bgRed;
var logE = console.error
var warn = clc.bgYellow;
var logW = console.warn
var info = clc.bgCyan;
var logI = console.info
var success = clc.bgGreen;
var logS = console.log

// vars for installation
let provider = base[0]
let modpack_id = base[1]
let modpack_version = base[2]

// what's the saved file's name?
let savedFile = ""

// set the pattern up to find forge installer

const entries = fg.sync(['+(installer)', '*.jar']);

/* DEBUG
console.log(provider)
console.log(modpack_id)
console.log(modpack_version)
*/

// links and stuff
function link(type) {
    switch (type) {
        case "install":
            switch (provider) {
                case "ftb":
                    return `https://api.modpacks.ch/public/modpack/${modpack_id}/${modpack_version}/server/arm/linux`
            }
            break;
        case "info":
                    return `https://api.modpacks.ch/public/modpack/${modpack_id}`
    }
}

// checks if provider is FTB or not
switch (provider) {
    case undefined: logE(`${
            error(" ERROR ")
        } no provider (ftb, curseforge, etc)`)
        break;
    case "": logE(`${
            error(" ERROR ")
        } no provider (ftb, curseforge, etc)`)
}

if (provider === "ftb") {
    logI(`${
        info(" INFO ")
    } ftb detected. installing...`)
    download("ftb")
} else {
    logE(`${
        error(" ERROR ")
    } other provider detected (nothing will happen)`)
    download("other")
}

function download() {

    logW(`${
        warn(" WARNING ")
    } this installer will ONLY install the ARM based ftb server installer`)

    switch (provider) {
        case "ftb":
            // firstly, let's prepare our links using the function for it
            (async () => {
                const downloader = new Downloader({
                    url: link("install"),
                    directory: "./",
                    onBeforeSave: (deducedName) => {
                        savedFile = deducedName;
                    }
                });
                try {
                    await downloader.download();

                    logS(`${
                        success(" DONE ")
                    } all done!`)
                    install()
                } catch (error) {
                    logE(`${
                        error(" ERROR ")
                    } download failed. attached logs:\n\n${error}`)
                }
            })();
            break;
        default: logE(`${
                error(" ERROR ")
            } other provider than ftb detected. nothing will happen`)
    }
}

function install() {
    exec(`chmod u+x ${__dirname}/${savedFile}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${
                error.message
            }`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`${stdout}`);
    });

    // runs the installer with deafults set
    fetch(link("info"), function (error, meta, body) {
    logI(`${
        info(" INFO ")
    } installing ${JSON.parse(body).name} for ARM`) // TODO: maybe search for the modpack id and put the name in (done)
});
    logI(`${
        info(" INFO ")
    } due to an unprecedented bug, output of the installer will not show up. please be patient, the script should stop once complete`)
    var child = require('child_process').exec(`${__dirname}/${savedFile} --auto`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${
                error.message
            }`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`${stdout}`);
    });

    // runs the forge installer (if any)
    child.on('exit', function() {
    if (entries.length === 0) {
        return logS(`${
            success(" SUCCESS ")
        } FTB server fully installed. however no forge installer can be found.`)
    }
    exec(`java -jar ${__dirname}/${entries[0]} --installServer`, (error, stdout, stderr) => {
        logI(`${
            info(" INFO ")
        } FTB server fully installed. installing forge...`)
        if (error) {
            console.log(`error: ${
                error.message
            }`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`${stdout}`);
    });
    logS(`${
        success(" SUCCESS ")
    } FTB server installed.`)

    /*
    fs.unlink(`${__dirname}/${entries[0]}`, function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log("File removed:", path);
        }
      });
      */
    process.exit()
})
}
