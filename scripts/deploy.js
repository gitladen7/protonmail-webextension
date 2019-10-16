const cp = require("child_process");
const fs = require("fs");

function run(str) {
    console.log(cp.execSync(str).toString());
}

const version = JSON.parse(fs.readFileSync("./package.json").toString()).version;

if (cp.spawnSync("git", ["diff-index", "--quiet", "HEAD"]).status !== 0) {
    console.log("commit first");
    process.exit(0);
}

// chromium
run("npm run build:chromium");
run(`node scripts/pack.js extension chromium-${version}`);

// firefox
run("npm run build:firefox");
run(`node scripts/pack.js extension firefox-${version}`);

run(`node scripts/pack.js source source-${version}`);

console.log("finished!");
