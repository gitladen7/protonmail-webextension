import { createStore } from "redux";
import { rootReducer, rootAction } from "../shared/store";
import { logger } from "./helpers/logger";
import { popupTracker } from "./helpers/popupTracker";
import { persistorService } from "./services/persistorService";

export const backgroundStore = createStore(rootReducer);
backgroundStore.dispatch(rootAction.ui.setUI({ loading: false }));

export const backgroundStoreSettings = {
    dontSendStateToPopup: false,
};

const sendStateToPopup = async () => {
    try {
        logger.debug("sending state to popup...");
        await browser.runtime.sendMessage({
            name: "STATE_CHANGED",
            payload: backgroundStore.getState(),
        });
    } catch (error) {
        // if popup isn't open this will fail, just ignore the error
    }
};

backgroundStore.subscribe(async () => {
    if (!backgroundStoreSettings.dontSendStateToPopup) {
        sendStateToPopup();
    } else {
        logger.debug("skipping sendStateToPopup");
    }
    await persistorService.saveState();
});

popupTracker.on("open", () => {
    sendStateToPopup();
});
