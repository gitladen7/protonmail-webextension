import { EventEmitter } from "events";
import { logger } from "./logger";

export class PopupTracker extends EventEmitter {
    public isOpen = false;

    constructor() {
        super();
        browser.runtime.onConnect.addListener((externalPort) => {
            externalPort.onDisconnect.addListener(() => {
                logger.debug("popup closed");
                this.isOpen = false;
                this.emit("close");
            });

            logger.debug("popup opened");
            this.isOpen = true;
            this.emit("open");
        });
    }
}

export const popupTracker = new PopupTracker();
