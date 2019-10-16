const fs = require("fs");

const scripts = [
    "save",
    "load",
    "autofill",
];

const envList = scripts.map((name) => {
    return {
        name,
        content: fs.readFileSync(`./src/background/contentScripts/${name}.js`).toString("base64"),
    };
});

envList.push({
    name: "POLYFILL",
    content: "<script type=\"application/javascript\" src=\"browser-polyfill.js\"></script>",
});

fs.writeFileSync("./.env", envList.map((s) => `REACT_APP_${s.name.toUpperCase()}=${s.content}`).join("\n"));
