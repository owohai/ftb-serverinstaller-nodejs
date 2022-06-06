const {exec} = require("child_process")
const Downloader = require("nodejs-file-downloader");
const path = require('path')
let base = process.argv.slice(2)

// CLI colors
var clc = require("cli-color");
var error = clc.bgRed; var logE = console.error
var warn = clc.bgYellow; var logW = console.warn
var info = clc.bgCyan; var logI = console.info
var success = clc.bgGreen; var logS = console.log

// vars for installation
let provider = base[0]
let modpack_id = base[1]
let modpack_version = base[2]

// what's the saved file's name?
let savedFile = ""

/* DEBUG
console.log(provider)
console.log(modpack_id)
console.log(modpack_version)
*/

// checks if provider is FTB or not
switch (provider) {
    case undefined:
        logE(`${error(" ERROR ")} no provider (ftb, curseforge, etc)`)
        break;
    case "":
        logE(`${error(" ERROR ")} no provider (ftb, curseforge, etc)`)
}

if (provider === "ftb") {
    logI(`${info(" INFO ")} ftb detected. installing...`)
    download("ftb")
} else {
    logE(`${error(" ERROR ")} other provider detected (nothing will happen)`)
    download("other")
}

function download() {

    logW(`${warn(" WARNING ")} this installer will ONLY install the ARM based ftb server installer`)

    switch (provider) {
        case "ftb":
            // firstly, let's prepare our links using the function for it
            (async () => {
                const downloader = new Downloader({
                  url: link(), 
                  directory: "./", 
                  onBeforeSave: (deducedName) => {
                      savedFile = deducedName;
                  }
                });
                try {
                  await downloader.download(); 
              
                  logS(`${success(" DONE ")} all done!`)
                  install()
                } catch (error) {
                 logE(`${error(" ERROR ")} download failed. attached logs:\n\n${error}`)
                }
              })();
            break;
        default:
            logE(`${error(" ERROR ")} other provider than ftb detected. nothing will happen`)
    }
}

function link() {
    switch (provider) {
        case "ftb":
            return `https://api.modpacks.ch/public/modpack/${modpack_id}/${modpack_version}/server/arm/linux`
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
    logI(`${info(" INFO ")} installing FTB server for ARM`) // TODO: maybe search for the modpack id and put the name in
    logI(`${info(" INFO ")} due to an unprecedented bug, output of the installer will not show up. please be patient, the script should stop once complete`)
    exec(`${__dirname}/${savedFile} --auto`, (error, stdout, stderr) => {
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
}