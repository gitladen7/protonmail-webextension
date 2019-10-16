export const peekFromPopup = async (email: string, fromAccountList: boolean = false) => {
    if (typeof browser === "undefined") {
        return;
    }

    await browser.runtime.sendMessage({
        name: "PEEK",
        payload: {
            email,
            fromAccountList,
        },
    });
};
