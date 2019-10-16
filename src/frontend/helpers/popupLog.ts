export const popupLog = async (str: string) => {
    if (typeof browser === "undefined") {
        return;
    }

    await browser.runtime.sendMessage({
        name: "LOG",
        payload: str,
    });
};
