import { IMessageMetadata } from "proton-api";
import { openEmail } from "../helpers/openEmail";
import { logger } from "../helpers/logger";
import { backgroundStore } from "../backgroundStore";
import { selectAccount } from "../helpers/selectors";
import { _, loadLocale } from "../../shared/i18n";
import { emailFetcherService } from "./emailFetcherService";

const dispatchedNotificationsCount = 0;

interface IDispatchedNotification {
    id: string;
    email: string;
    protonId: string;
    convId: string;
}

export class NotificationService {
    public dispatchedNotifications: IDispatchedNotification[] = [];

    constructor() {
        this.load();
    }

    async load() {
        browser.notifications.onClicked.addListener(async (id) => {
            const notif = this.dispatchedNotifications.find((n) => n.id === id);
            if (notif !== undefined && id.indexOf("proton-test-") !== 0) {
                const account = selectAccount(notif.email);
                if (account !== undefined && notif.convId !== "" && notif.protonId !== "") {
                    await openEmail(notif.email, `/inbox/${account.viewMode !== 0 ? notif.convId : notif.protonId}`);
                } else {
                    await openEmail(notif.email);
                }
            }
            await browser.notifications.clear(id);
        });

        (browser.notifications as any).onButtonClicked.addListener(async (id: string, buttonIndex: number) => {
            if (buttonIndex !== 0) {
                return;
            }
            const notif = this.dispatchedNotifications.find((n) => n.id === id);
            if (notif !== undefined && id.indexOf("proton-test-") !== 0) {
                const account = selectAccount(notif.email);
                if (account !== undefined && notif.protonId !== "") {
                    emailFetcherService.markAsRead(notif.email, [notif.convId]);
                    await browser.notifications.clear(id);
                }
            }
        });
    }

    async dispatchNotification(email: string, title: string, message: string, protonId: string, convId: string) {
        const id = `proton-${dispatchedNotificationsCount}`;
        this.dispatchedNotifications.unshift({
            id,
            email,
            protonId,
            convId,
        });
        this.dispatchedNotifications = this.dispatchedNotifications.slice(0, 100);
        const notifyObj = {
            type: "basic",
            message: message,
            title: title,
            iconUrl: browser.runtime.getURL("icons/logo-152.png"),
            buttons: protonId !== "" ? [
                {
                    title: _("notification_markAsRead"),
                },
            ] : [],
        } as any;

        if (/firefox/i.test(navigator.userAgent)) {
            delete notifyObj.buttons;
        }

        await browser.notifications.create(
            id,
            notifyObj
        );
    }

    formatNotificationString(str: string, email: string, messages: IMessageMetadata[]) {
        const count = messages.length;
        const firstMessage = messages[0];

        str = str.replace(/%email%/gi, email);

        if (count > 1) {
            str = str.replace(/%count%/gi, `${count}`);
        } else {
            str = str.replace(/%senderAddress%/gi, firstMessage.SenderAddress);
            str = str.replace(/%subject%/gi, firstMessage.Subject);
            str = str.replace(/%senderName%/gi, firstMessage.SenderName || firstMessage.SenderAddress);
        }

        return str;
    }

    async notify(email: string, messages: IMessageMetadata[]) {
        try {
            const count = messages.length;
            await loadLocale(backgroundStore.getState().settings.language);
            if (count === 1) {
                await this.dispatchNotification(email,
                    this.formatNotificationString(
                        backgroundStore.getState().settings.singleNotificationTitle || _("notification_single_title"),
                        email, messages),
                    this.formatNotificationString(
                        backgroundStore.getState().settings.singleNotificationMessage || _("notification_single_message"),
                        email, messages),
                    messages[0].ConversationID,
                    messages[0].ID,
                );
            } else if (count > 1) {
                await this.dispatchNotification(email,
                    this.formatNotificationString(
                        backgroundStore.getState().settings.multipleNotificationTitle || _("notification_multiple_title"),
                        email, messages),
                    this.formatNotificationString(
                        backgroundStore.getState().settings.multipleNotificationMessage || _("notification_multiple_message"),
                        email, messages),
                    "",
                    "",
                );
            }
        } catch (error) {
            logger.error(error);
        }
    }
}

export const notificationService = new NotificationService();
