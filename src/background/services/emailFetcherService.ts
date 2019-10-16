import { ProtonmailClient, DefaultLabels } from "proton-api";
import { notificationService } from "../services/notificationService";
import { logger } from "../helpers/logger";
import { backgroundStore } from "../backgroundStore";
import { rootAction } from "../../shared/store";
import { selectAccount } from "../helpers/selectors";
import { IPeekMessage } from "../../shared/store/peek/types";

let uniqId = 0;
export async function wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

interface ISessionState {
    uid: string;
    currentEventId: string;
    lastUnreadCount: number;
    lastViewMode: number;
}

const defaultSessionState: ISessionState = {
    uid: "",
    currentEventId: "",
    lastUnreadCount: -1,
    lastViewMode: -1,
};

export class EmailFetcherService {
    public sessionStates: ISessionState[] = [];

    async pulse() {
        const accounts = backgroundStore.getState().accounts;
        const startDate = Date.now();
        logger.debug("fetching emails...");

        const allSessionIds: string[] = [];

        for (const account of accounts) {
            for (const session of account.sessions) {
                allSessionIds.push(session.uid);
            }
            const session = account.sessions[0];

            if (session === undefined) {
                logger.debug(`skipping ${account.email} because not logged in`);
                continue;
            }

            const client = new ProtonmailClient({
                domain: session.domain,
            });
            (client as any).pmUID = session.uid;

            let state = this.sessionStates.find((s) => s.uid === session.uid);
            if (state === undefined) {
                state = {
                    ...defaultSessionState, uid: session.uid,
                };
                this.sessionStates.push(state);
            }

            try {
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const eventResponse =
                        state.currentEventId === "" ?
                            await client.events.latest() :
                            await client.events.get(state.currentEventId);

                    if (state.currentEventId !== eventResponse.EventID) {
                        logger.debug(`Got new event id for ${session.email}`);
                    }
                    state.currentEventId = eventResponse.EventID;

                    if (eventResponse.Messages !== undefined &&
                        account.notify) {
                        logger.debug(`${session.email} got new messages`);
                        const messages = [];
                        for (const message of eventResponse.Messages) {
                            if (message.Message !== undefined && message.Message.Unread === 1 && message.Action === 1) {
                                messages.push(message.Message);
                            }
                        }

                        logger.debug(`${account.email} notifying about ${messages.length} messages`);
                        notificationService.notify(account.email, messages);
                    }

                    if (eventResponse.Unread !== undefined) {
                        for (const unread of eventResponse.Unread.Locations) {
                            if (unread.Location === DefaultLabels.Inbox) {
                                logger.debug(`got ${unread.Count} unread messages for ${account.email} from event`);
                                backgroundStore.dispatch(rootAction.accounts.editAccount(account.email, {
                                    unreadCount: unread.Count,
                                }));
                                if (state.lastUnreadCount < unread.Count && backgroundStore.getState().peek.email === account.email) {
                                    this.peek(account.email, false);
                                }
                                state.lastUnreadCount = unread.Count;
                            }
                        }
                    }

                    if ((eventResponse as any).MailSettings !== undefined) {
                        try {
                            const viewMode = (eventResponse as any).MailSettings.ViewMode;
                            if (typeof viewMode === "number") {
                                logger.debug(`got ${viewMode} viewMode for ${account.email} from event`);
                                backgroundStore.dispatch(rootAction.accounts.editAccount(account.email, {
                                    viewMode: viewMode,
                                }));
                                state.lastViewMode = viewMode;
                            }
                        } catch (error) {
                            /* ignore */
                        }
                    }

                    if (state.lastUnreadCount === -1) {
                        logger.debug(`fetching latest messages count for ${account.email}`);
                        const unreadCountResponse = await client.messages.count();

                        for (const count of unreadCountResponse.Counts) {
                            if (count.LabelID === `${DefaultLabels.Inbox}`) {
                                logger.debug(`got ${count.Unread} unread messages for ${account.email}`);
                                backgroundStore.dispatch(rootAction.accounts.editAccount(account.email, {
                                    unreadCount: count.Unread,
                                }));
                                state.lastUnreadCount = count.Unread;
                            }
                        }
                    }

                    if (state.lastViewMode === -1) {
                        logger.debug(`fetching view mode for ${account.email}`);
                        const settingsResponse = await client.request({
                            method: "get",
                            url: "settings/mail",
                        });
                        try {
                            const viewMode = (settingsResponse.data as any).MailSettings.ViewMode;
                            if (typeof viewMode === "number") {
                                backgroundStore.dispatch(rootAction.accounts.editAccount(account.email, {
                                    viewMode: viewMode,
                                }));
                                logger.debug(`fetched view mode for ${account.email}: ${viewMode}`);
                                state.lastViewMode = viewMode;
                            }
                        } catch (error) {
                            /* ignore */
                        }
                    }

                    if (eventResponse.More !== 1) {
                        break;
                    }
                }
            } catch (error) {
                // invalid event
                if (error && error.response && error.response.data && error.response.data.Code === 18001) {
                    state.currentEventId = "";
                    state.lastUnreadCount = -1;
                    logger.debug(`${session.email} invalid event id`);
                } else if (error && error.response && error.response.status === 401) {
                    try {
                        await (client as any).request({
                            method: "post",
                            url: "auth/refresh",
                            data: undefined,
                        });

                    } catch (error) {
                        if (error && error.response &&
                            (error.response.status >= 400 &&
                                error.response.status !== 429 &&
                                error.response.status < 500)) {
                            // session expired! remove it
                            backgroundStore.dispatch(rootAction.accounts.removeSessionFromAccount(account.email, session.uid));
                            logger.debug(`${session.email} session expired`);
                        }
                    }
                } else {
                    logger.debug(error);
                }
            }
        }

        this.sessionStates = this.sessionStates.filter((s) => allSessionIds.indexOf(s.uid) !== -1);
        const elapsed = Date.now() - startDate;
        logger.debug(`finished fetching emails, elapsed: ${elapsed}`);
    }

    async peek(email: string, fromAccountList: boolean) {
        const startDate = Date.now();
        logger.debug("peeking emails...");
        try {

            const account = selectAccount(email);
            if (account === undefined) {
                throw new Error("Account is undefined");
            }

            if (fromAccountList) {
                backgroundStore.dispatch(rootAction.peek.setPeek({
                    loading: true,
                    messages: [],
                    email: email,
                }));
            } else {
                backgroundStore.dispatch(rootAction.peek.setPeek({
                    loading: true,
                }));
            }

            const session = account.sessions[0];
            if (session === undefined) {
                throw new Error("Session is undefined");
            }

            const client = new ProtonmailClient({
                domain: session.domain,
            });
            (client as any).pmUID = session.uid;

            const unreadMessages = await client.messages.list({
                LabelID: DefaultLabels.Inbox,
                Page: 0,
                Limit: 10,
                Unread: true,
            });

            const peekMessages: IPeekMessage[] = [];
            for (const message of unreadMessages.Messages) {
                peekMessages.push({
                    id: ++uniqId,
                    protonId: message.ID,
                    protonConvId: message.ConversationID,
                    subject: message.Subject,
                    from: message.SenderAddress,
                    fromName: message.SenderName,
                    date: message.Time * 1000,
                    read: false,
                });
                if (peekMessages.length > 10) {
                    break;
                }
            }

            backgroundStore.dispatch(rootAction.peek.loadPeek({
                email: email,
                messages: peekMessages,
                loading: false,
                error: "",
                total: unreadMessages.Total,
            }));

        } catch (error) {
            logger.debug(error);
            backgroundStore.dispatch(rootAction.peek.setPeek({
                loading: false,
                error: `${error}`,
            }));
        }

        const elapsed = Date.now() - startDate;
        logger.debug(`finished peeking emails, elapsed: ${elapsed}`);
    }

    async markAsRead(email: string, IDs: string[]) {
        const startDate = Date.now();
        logger.debug(`marking ${IDs.length} emails as read`);

        try {
            const account = selectAccount(email);
            if (account === undefined) {
                throw new Error("Account is undefined");
            }

            const session = account.sessions[0];
            if (session === undefined) {
                throw new Error("Session is undefined");
            }

            const client = new ProtonmailClient({
                domain: session.domain,
            });
            (client as any).pmUID = session.uid;

            await client.messages.markAsRead(IDs);
        } catch (error) {
            logger.debug(error);
        }

        const elapsed = Date.now() - startDate;
        logger.debug(`finished fetching emails, elapsed: ${elapsed}`);
    }
}

export const emailFetcherService = new EmailFetcherService();
