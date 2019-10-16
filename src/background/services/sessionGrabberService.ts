import { ISharedSessionObject } from "../../shared/store/accounts/types";
import { logger } from "../helpers/logger";
import { selectSession, selectAccount } from "../helpers/selectors";
import { defaultAccount } from "../../shared/store/accounts/reducers";
import { protonDomains } from "../../shared/protonDomains.js";
import { backgroundStore } from "../backgroundStore";
import { rootAction } from "../../shared/store";
import { fetcherCronService } from "./fetcherCronService";

export class SessionGrabberService {
    private lastReqTime = 0;
    private blacklistedSessions: string[] = [];

    async init() {
        try {
            await this.importMissingCookies();
            browser.webRequest.onSendHeaders.addListener(
                this.onProtonAPIRequest.bind(this),
                {
                    urls: protonDomains.map((d) => `https://${d}/api/*`),
                },
                ["requestHeaders"],
            );

            browser.cookies.onChanged.addListener(this.onCookiesChange.bind(this));
        } catch (error) {
            logger.error(error);
        }
    }

    async onCookiesChange(arg: {
        removed: boolean;
        cookie: browser.cookies.Cookie;
        cause: browser.cookies.OnChangedCause;
    }) {
        try {
            const name = arg.cookie.name;
            const value = arg.cookie.value;
            const isAccessTokenCookie = name.startsWith("AUTH-");
            const isRefreshTokenCookie = name.startsWith("REFRESH-");

            if (!isAccessTokenCookie &&
                !isRefreshTokenCookie) {
                return;
            }

            const uid = name.replace(/^.*-/, "");
            const session = selectSession(uid);
            if (session === undefined ||
                (isAccessTokenCookie && session.accessTokenCookie === value) ||
                (isRefreshTokenCookie && session.refreshTokenCookie === value)) {
                return;
            }

            logger.debug(`access or refresh token cookie refreshed for uid=${uid}`);
            backgroundStore.dispatch(rootAction.accounts.editSessionFromAccount(session.email, session.uid, {
                accessTokenCookie: isAccessTokenCookie ? value : session.accessTokenCookie,
                refreshTokenCookie: isRefreshTokenCookie ? value : session.refreshTokenCookie,
            }));
        } catch (error) {
            logger.error(error);
        }
    }

    async isTabIncognitoOrContainer(tabId: number) {
        const tab = await browser.tabs.get(tabId);
        if (tab.incognito && !browser.extension.inIncognitoContext) {
            // Show a message telling that incognito is not supported unless enabled globally
            if (backgroundStore.getState().ui.showIncognitoModeWarning !== true) {
                backgroundStore.dispatch(rootAction.ui.setUI({
                    showIncognitoModeWarning: true,
                }));
            }
            return true;
        }

        if (/^firefox-container/.test(tab.cookieStoreId || "")) {
            // Show a message telling that cookie containers are not supported.
            if (backgroundStore.getState().ui.showContainersWarning !== true) {
                backgroundStore.dispatch(rootAction.ui.setUI({
                    showContainersWarning: true,
                }));
            }
            return true;
        }

        return false;
    }

    async grabSessionObject(tabId: number): Promise<ISharedSessionObject | undefined> {
        const result = await browser.tabs.executeScript(tabId, {
            code: atob(`${process.env.REACT_APP_SAVE}`),
        });

        const sharedSessionObject = result[0] as ISharedSessionObject;
        if (typeof sharedSessionObject.email !== "string" ||
            sharedSessionObject.email === "" ||
            sharedSessionObject.windowName === "" ||
            sharedSessionObject.windowName === "{}") {
            return undefined;
        }

        return sharedSessionObject;
    }

    async onProtonAPIRequest(e: any) {
        if (e.tabId === -1) {
            return;
        }

        if (Date.now() - this.lastReqTime < 1000) {
            return;
        }
        this.lastReqTime = Date.now();

        try {
            const domain = `${e.url}`.replace(/^https:\/\//gi, "").replace(/\/.*$/g, "");
            let uid = "";
            for (const header of e.requestHeaders) {
                const name = (header.name as string).toLowerCase();
                if (name === "x-pm-uid") {
                    uid = header.value;
                }
            }

            if (uid === "") {
                return;
            }

            if (this.blacklistedSessions.indexOf(uid) !== -1) {
                return;
            }

            const session = selectSession(uid);
            if (session !== undefined) {
                const account = selectAccount(session.email);
                if (account === undefined ||
                    account.persist !== true) {
                    return;
                }

                if (session.sharedSessionObject.windowName !== "") {
                    return; // already processed
                }

                const sessionObject = await this.grabSessionObject(e.tabId);
                if (sessionObject === undefined) {
                    return;
                }

                backgroundStore.dispatch(rootAction.accounts.editSessionFromAccount(session.email, session.uid, {
                    sharedSessionObject: {
                        ...session.sharedSessionObject, windowName: sessionObject.windowName,
                    },
                }));

                return; // already processed
            }

            const badTab = await this.isTabIncognitoOrContainer(e.tabId);
            if (badTab === true) {
                this.blacklistedSessions.unshift(uid);
                this.blacklistedSessions = this.blacklistedSessions.slice(0, 50);
                return;
            }

            const sharedSessionObject = await this.grabSessionObject(e.tabId);
            if (sharedSessionObject === undefined) {
                return;
            }

            const email = sharedSessionObject.email;
            if (selectAccount(email) === undefined) {
                backgroundStore.dispatch(rootAction.accounts.addAccount({
                    ...defaultAccount, email: email,
                }));
                logger.debug(`new account (${email}) added`);
            }

            if (selectSession(uid) === undefined) {
                const accountByEmail = selectAccount(email);
                if (accountByEmail !== undefined && !accountByEmail.persist) {
                    sharedSessionObject.windowName = "";
                }

                const allCookies = await this.getAllCookies();
                const authCookie = allCookies.find((n) => n.name === `AUTH-${uid}`);
                const refreshCookie = allCookies.find((n) => n.name === `REFRESH-${uid}`);

                if (authCookie === undefined ||
                    refreshCookie === undefined
                ) {
                    logger.error(`could not add session, missing cookies for uid=${uid}`);
                    return;
                }

                backgroundStore.dispatch(rootAction.accounts.addSessionToAccount(email, {
                    domain,
                    email,
                    uid,
                    sharedSessionObject,
                    accessTokenCookie: authCookie.value,
                    refreshTokenCookie: refreshCookie.value,
                }));

                logger.debug(`new session (${uid}) added`);
                fetcherCronService.pulse();
            }
        } catch (error) {
            logger.error(error);
        }
    }

    async getAllCookies() {
        const allCookies = [];

        for (const domain of protonDomains) {
            const cookies = [...await browser.cookies.getAll({
                url: `https://${domain}/api/`,
                path: "/api/",
            }), ...await browser.cookies.getAll({
                url: `https://${domain}/api/auth/refresh`,
                path: "/api/auth/refresh",
            })];
            for (const cookie of cookies) {
                allCookies.push(cookie);
            }
        }

        return allCookies;
    }

    async importMissingCookies() {
        const accounts = backgroundStore.getState().accounts;
        try {
            const allCookies = await this.getAllCookies();

            for (const account of accounts) {
                for (const session of account.sessions) {
                    const uid = session.uid;
                    const authCookie = allCookies.find((n) => n.name === `AUTH-${uid}`);
                    const refreshCookie = allCookies.find((n) => n.name === `REFRESH-${uid}`);

                    if (authCookie === undefined &&
                        refreshCookie === undefined &&
                        session.accessTokenCookie !== undefined &&
                        session.refreshTokenCookie !== undefined) {
                        logger.debug(`importing cookies for uid=${uid}`);
                        try {
                            await browser.cookies.set({
                                url: `https://${session.domain}/api/`,
                                name: `AUTH-${uid}`,
                                path: "/api/",
                                httpOnly: true,
                                secure: true,
                                value: session.accessTokenCookie as string,
                                // sameSite: "no_restriction"
                            } as any);
                            await browser.cookies.set({
                                url: `https://${session.domain}/api/auth/refresh`,
                                name: `REFRESH-${uid}`,
                                path: "/api/auth/refresh",
                                httpOnly: true,
                                secure: true,
                                value: session.refreshTokenCookie as string,
                                // sameSite: "no_restriction"
                            } as any);
                        } catch (error) {
                            logger.error(error);
                        }
                    }
                }
            }
        } catch (error) {
            logger.error(error);
        }
    }
}

export const sessionGrabberService = new SessionGrabberService();
