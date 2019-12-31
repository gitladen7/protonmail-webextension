import { logger } from "./logger";
import { openProtonmail } from "./openProtonmail";
import { protonDomains } from "../../shared/protonDomains.js";
import { selectAccount } from "./selectors";
import { backgroundStore } from "../backgroundStore";

const doCompose = async (composeData: any, tabId: number) => {
    try {
        const response = await browser.tabs.executeScript(tabId, {
            code: atob(`${process.env.REACT_APP_COMPOSE}`).replace(/"%obj%"/g, JSON.stringify(composeData)),
            runAt: "document_start",
        });

        if (`${response[0]}`.startsWith("error")) {
            logger.error(response[0]);
        }
    } catch (error) {
        logger.error(error);
    }
};

const doRegisterProtocolHandle = async (email: string, tabId: number) => {
    try {
        const response = await browser.tabs.executeScript(tabId, {
            code: atob(`${process.env.REACT_APP_REGISTERPROTOCOLHANDLER}`)
                .replace(/"%email%"/g, JSON.stringify(email))
                .replace(/"%token%"/g, JSON.stringify(backgroundStore.getState().settings.mailtoHandlerToken)),
            runAt: "document_start",
        });

        if (`${response[0]}`.startsWith("error")) {
            logger.error(response[0]);
        }
    } catch (error) {
        logger.error(error);
    }
};

export const openEmail = async (email: string, path: string = "/inbox",
    registerProtocolHandle: boolean = false, composeData: any | undefined = undefined) => {
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

        if (path.indexOf("/inbox/") !== -1) {
            await browser.tabs.executeScript(tab.id, {
                // eslint-disable-next-line max-len
                code: `window.history.pushState({}, "", ${JSON.stringify(path)});window.dispatchEvent(new PopStateEvent("popstate", {state: {}}));`,
                runAt: "document_start",
            });
        }

        await Promise.all([browser.tabs.update(tab.id, {
            active: true,
        }),
        browser.windows.update(tab.windowId, {
            focused: true,
        })]);

        if (registerProtocolHandle) {
            doRegisterProtocolHandle(email, tab.id);
        }

        if (composeData !== undefined) {
            doCompose(composeData, tab.id);
        }
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

    if (registerProtocolHandle) {
        doRegisterProtocolHandle(email, newTab.id as number);
    }

    if (composeData !== undefined) {
        doCompose(composeData, newTab.id as number);
    }
};
