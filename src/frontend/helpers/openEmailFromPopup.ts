export const openEmailFromPopup = async (email: string, path: string, registerAsProtocolHandler: boolean = false) => {
    if (typeof browser === "undefined") {
        return;
    }

    await browser.runtime.sendMessage({
        name: "OPEN_EMAIL",
        payload: {
            email,
            path,
            registerAsProtocolHandler,
        },
    });
    window.close();
};
