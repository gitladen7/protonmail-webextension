import { AppState, rootAction } from "../../shared/store";
import { logger } from "../helpers/logger";
import { backgroundStore } from "../backgroundStore";
import { defaultPeekState } from "../../shared/store/peek/reducers";
import { availableLanguages } from "../../shared/i18n";
import { defaultSettings } from "../../shared/store/settings/reducers";

export class PersistorService {
    public version = "1";

    async loadState() {
        try {
            const storedState = (await browser.storage.local.get("globalState") as any).globalState as AppState & { version: string };
            if (storedState === undefined) { // happens on first load
                logger.debug("storedState is empty, using default state");
                const language = browser.i18n.getUILanguage().replace(/-.*/g, "");
                logger.debug(`UI language: ${language}`);
                if (availableLanguages.findIndex((l) => l.lang === language) !== -1) {
                    backgroundStore.dispatch(rootAction.settings.setSettings({ language: language }));
                }
                return;
            }

            if (storedState.version !== this.version) {
                logger.debug("state version missmatch, using default state"); // TODO: add migrations
                return;
            }

            // set after 1.8.0
            if (storedState.settings.mailtoHandlerToken === undefined) {
                storedState.settings.mailtoHandlerToken = defaultSettings.mailtoHandlerToken;
            }

            backgroundStore.dispatch(rootAction.accounts.loadAccounts(storedState.accounts));
            backgroundStore.dispatch(rootAction.ui.loadUI(storedState.ui));
            backgroundStore.dispatch(rootAction.settings.loadSettings(storedState.settings));

            logger.debug("Initial state retrieved");
        } catch (error) {
            logger.error(error);
            // reset the state
            await this.saveState();
        }
    }

    async saveState() {
        try {
            const globalStateCopy = JSON.parse(JSON.stringify(backgroundStore.getState())) as AppState & { version: string };
            for (const account of globalStateCopy.accounts) {
                if (!account.persist || !account.persistToDisk) {
                    account.sessions = [];
                    account.sessionExpired = false;
                }
                account.unreadCount = 0;
            }

            globalStateCopy.ui.syncing = false;
            globalStateCopy.ui.loading = false;
            globalStateCopy.version = this.version;
            globalStateCopy.peek = defaultPeekState;

            await browser.storage.local.set({
                globalState: globalStateCopy as any,
            });
        } catch (error) {
            logger.error(error);
        }
    }
}

export const persistorService = new PersistorService();
