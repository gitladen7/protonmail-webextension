export const syncFromPopup = async () => {
    if (typeof browser === "undefined") {
        return;
    }

    await browser.runtime.sendMessage({
        name: "PULSE",
        payload: {},
    });
};
