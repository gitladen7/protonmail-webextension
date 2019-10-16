export const markAsReadFromPopup = async (email: string, ids: string[]) => {
    if (typeof browser === "undefined") {
        return;
    }

    await browser.runtime.sendMessage({
        name: "MARK_AS_READ",
        payload: {
            email,
            ids,
        },
    });
};
