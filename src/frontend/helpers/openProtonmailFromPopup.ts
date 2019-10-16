export const openProtonmailFromPopup = async () => {
    if (typeof browser === "undefined") {
        return;
    }
    await browser.runtime.sendMessage({
        name: "OPEN_PROTONMAIL",
        payload: "",
    });
    window.close();
};
