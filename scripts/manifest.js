const fs = require("fs");

const platform = process.argv[2];

function generateManifest() {
    const apiPaths = [
        "/api/events/",
        "/api/messages/count",
        "/api/messages",
        "/api/messages/read",
        "/api/settings/mail",
        "/api/auth/refresh",
    ];

    const urls = [];
    const protonDomains = require("../src/shared/protonDomains").protonDomains;

    for (const domain of protonDomains) {
        for (const apiPath of apiPaths) {
            urls.push(`https://${domain}${apiPath}`);
        }
    }

    const csp = `default-src 'self'; connect-src ${urls.join(" ")}`;

    const permissions = [
        ...protonDomains.map((d) => `https://${d}/*`),
        ...["tabs",
            "storage",
            "cookies",
            "notifications",
            "webRequest",
            "alarms"],
    ];

    const manifest = {
        "manifest_version": 3,
        "name": "__MSG_extension_name__",
        "version": JSON.parse(fs.readFileSync("./package.json").toString()).version,
        "description": "__MSG_extension_description__",
        "homepage_url": "https://github.com/gitladen7/protonmail-webextension",
        "default_locale": "en",
        "icons": {
            "16": "icons/icon.svg",
            "48": "icons/icon.svg",
            "96": "icons/icon.svg",
        },
        "permissions": permissions,
        "action": {
            "browser_style": false,
            "default_popup": "index.html",
            "default_icon": "icons/icon.svg",
            "default_title": "ProtonMail",
            "theme_icons": [
                {
                    "light": "icons/icon-light.svg",
                    "dark": "icons/icon.svg",
                    "size": 32,
                },
            ],
        },
        "background": {
            "scripts": [
                "browser-polyfill.js",
                "background.js",
            ],
        },
        "content_security_policy": csp,
    };


    if (platform !== "firefox") {
        manifest.icons = {
            "16": "icons/icon-16.png",
            "32": "icons/icon-32.png",
            "64": "icons/icon-64.png",
            "128": "icons/icon-128.png",
        };
        manifest.action.theme_icons = undefined;
        manifest.action.default_icon = {
            "16": "icons/icon-16.png",
            "32": "icons/icon-32.png",
        };
    }

    fs.writeFileSync("./build/manifest.json", JSON.stringify(manifest, null, 4));
}

generateManifest();
