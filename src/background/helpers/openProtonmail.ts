import { backgroundStore } from "../backgroundStore";

export const openProtonmail = async (email: string) => {
    const newTab = await browser.tabs.create({
        active: true,
        url: `https://${backgroundStore.getState().settings.preferredDomain}/inbox`,
    });

    if (email !== "") {
        await browser.tabs.executeScript(newTab.id, {
            code: (`${process.env.REACT_APP_AUTOFILL}`).replace(/"%email%"/g, JSON.stringify(email)),
        });
    }
};
