export const changeIcon = (light: boolean) => {
    if (typeof browser === "undefined") {
        return;
    }

    return browser.browserAction.setIcon({
        path: light ? "icons/icon-light-32.png" : "icons/icon-32.png",
    });
};
