export const openEmailFromPopup = async (email: string, path: string) => {
    if (typeof browser === "undefined") {
        return;
    }

    await browser.runtime.sendMessage({
        name: "OPEN_EMAIL",
        payload: {
            email,
            path,
        },
    });
    window.close();
};
