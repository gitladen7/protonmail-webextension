const fs = require("fs");

const scripts = [
    "save",
    "load",
    "autofill",
    "compose",
    "registerProtocolHandler",
    "navigateTo"
];

const envList = scripts.map((name) => {
    return {
        name,
        content: `base64:${fs.readFileSync(`./src/background/contentScripts/${name}.js`).toString("base64")}`,
    };
});

envList.push({
    name: "POLYFILL",
    content: "<script type=\"application/javascript\" src=\"browser-polyfill.js\"></script>",
});

envList.push({
    name: "VERSION",
    content: JSON.parse(fs.readFileSync("./package.json").toString()).version,
});

fs.writeFileSync("./.env", envList.map((s) => `REACT_APP_${s.name.toUpperCase()}=${s.content}`).join("\n"));
