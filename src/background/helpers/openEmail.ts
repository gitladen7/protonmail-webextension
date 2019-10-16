import { logger } from "./logger";
import { openProtonmail } from "./openProtonmail";
import { protonDomains } from "../../shared/protonDomains.js";
import { selectAccount } from "./selectors";

export const openEmail = async (email: string, path: string = "/inbox") => {
    const account = selectAccount(email);
    if (account === undefined) {
        logger.debug(`account not found. email: ${email}`);
        return;
    }

    // search the tab first
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
        const domain = `${tab.url}`.replace(/^https:\/\//gi, "").replace(/\/.*$/, "");
        if (protonDomains.indexOf(domain) === -1) {
            continue;
        }
        if (`${tab.title}`.indexOf(account.email) === -1 ||
            typeof tab.id !== "number") {
            continue;
        }

        await Promise.all([browser.tabs.update(tab.id, {
            active: true,
        }),
        browser.windows.update(tab.windowId, {
            focused: true,
        })]);
        return;
    }

    const session = account.sessions[0];

    if (session === undefined ||
        session.sharedSessionObject.windowName === "") {
        logger.debug("No sessions found for this item, opening login tab");
        await openProtonmail(account.email);
        return;
    }

    logger.debug("opening tab...");

    // open if not found
    const newTab = await browser.tabs.create({
        active: true,
        url: `https://${session.domain}${path}`,
    });

    logger.debug("executing script in tab...");
    const response = await browser.tabs.executeScript(newTab.id, {
        code: atob(`${process.env.REACT_APP_LOAD}`).replace(/"%obj%"/g, JSON.stringify(session.sharedSessionObject || {})),
        runAt: "document_start",
    });

    if (`${response[0]}`.startsWith("error")) {
        logger.error(response[0]);
    }
};
