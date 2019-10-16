const JSZip = require("jszip");
const glob = require("glob");
const fs = require("fs");

const what = process.argv[2];
if (["extension", "source"].indexOf(what) === -1) {
    process.exit(1);
}

const outFile = `${process.argv[3] || what}`;

const files = what === "extension" ?
    glob.sync("build/**/*", {
        nodir: true,
    }) :
    glob.sync("./**/*", {
        nodir: true,
        dot: true,
        ignore: ["./node_modules/**",
            "./.git/**",
            "./build/**",
            "./TODO.md",
            "./misc/**",
            "./*.zip"],
    });

const zip = new JSZip();
for (const file of files) {
    zip.file(file.replace(/^build./, ""), fs.readFileSync(file));
}
zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: {
        level: 9,
    },
}).then(function (buffer) {
    fs.writeFileSync(`${outFile}.zip`, buffer);
    console.log(`${outFile} created`);
});

