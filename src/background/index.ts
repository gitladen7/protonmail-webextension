import { IBackgroundPage } from "../shared/types";
import { logger } from "./helpers/logger";
import { openEmail } from "./helpers/openEmail";
import { sessionGrabberService } from "./services/sessionGrabberService";
import { persistorService } from "./services/persistorService";
import { emailFetcherService } from "./services/emailFetcherService";
import { openProtonmail } from "./helpers/openProtonmail";
import { popupTracker } from "./helpers/popupTracker";
import { backgroundStore, backgroundStoreSettings } from "./backgroundStore";
import { RootAction } from "../shared/store";
import { setupBadgeUpdater } from "./helpers/updateBadge";
import { fetcherCronService } from "./services/fetcherCronService";

(async () => {
    setupBadgeUpdater();

    await persistorService.loadState();
    await sessionGrabberService.init();

    browser.runtime.onMessage.addListener(async (obj: any) => {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<any>(async (resolve) => {
            interface IMessage {
                name: string;
                payload: any;
            }

            try {
                const message = obj as IMessage;
                logger.debug(`new message received: ${message.name}`);
                if (message.name === "LOG") {
                    logger.debug(message.payload);
                } else if (message.name === "OPEN_EMAIL") {
                    await openEmail(message.payload.email,
                        message.payload.path !== "" ? message.payload.path : undefined, message.payload.registerAsProtocolHandler);
                } else if (message.name === "OPEN_PROTONMAIL") {
                    await openProtonmail("");
                } else if (message.name === "PROCESS_REDUX_ACTION") {
                    const action = message.payload as RootAction;
                    backgroundStoreSettings.dontSendStateToPopup = true;
                    logger.debug(`dispatching received action: ${message.payload.type}`);
                    backgroundStore.dispatch(action);
                    backgroundStoreSettings.dontSendStateToPopup = false;
                    return resolve(backgroundStore.getState());
                } else if (message.name === "PULSE") {
                    fetcherCronService.pulse();
                } else if (message.name === "PEEK") {
                    emailFetcherService.peek(message.payload.email, message.payload.fromAccountList);
                } else if (message.name === "MARK_AS_READ") {
                    await emailFetcherService.markAsRead(message.payload.email, message.payload.ids);
                    fetcherCronService.pulse();
                }
            } catch (error) {
                logger.error(error);
            }
            resolve();
        });
    });

    popupTracker.on("open", () => {
        const email = backgroundStore.getState().peek.email;
        if (email !== "") {
            emailFetcherService.peek(email, false);
        }
    });

    await fetcherCronService.init();

    (browser.extension.getBackgroundPage() as any as IBackgroundPage).backgroundPageInitialized = true;
    logger.debug("Initialization completed");
})();
