import { backgroundStore } from "../backgroundStore";
import { AppState } from "../../shared/store";

let latestBadgeText = "-";
let latestUseLightIcon: boolean | undefined = undefined;

export const updateBadge = async (state: AppState) => {
    const accounts = state.accounts;
    let totalUnread = 0;
    for (const account of accounts) {
        totalUnread += account.sessions.length !== 0 && account.showUnreadCountBadge ? account.unreadCount : 0;
    }

    let badgeText = totalUnread !== 0 ? `${totalUnread}` : "";

    if (totalUnread > 9999) {
        badgeText = `${Math.floor(totalUnread / 1000)}K`;
    }

    if (accounts.find((s) => s.sessionExpired === true) !== undefined) {
        badgeText = "ERR";
    }

    if (latestBadgeText !== badgeText) {
        browser.browserAction.setBadgeText({
            text: badgeText,
        });
        latestBadgeText = badgeText;
    }

    if (!/firefox/i.test(navigator.userAgent) && latestUseLightIcon !== state.settings.useLightIcon) {
        browser.browserAction.setIcon({
            path: state.settings.useLightIcon ? "icons/icon-light-32.png" : "icons/icon-32.png",
        });
        latestUseLightIcon = state.settings.useLightIcon;
    }
};

export const setupBadgeUpdater = () => {
    backgroundStore.subscribe(() => {
        updateBadge(backgroundStore.getState());
    });

    try {
        browser.browserAction.setBadgeTextColor({
            color: "#FFFFFF",
        });
    } catch (error) {
        // firefox only
    }

    browser.browserAction.setBadgeBackgroundColor({
        color: "#FF0000",
    });
};
