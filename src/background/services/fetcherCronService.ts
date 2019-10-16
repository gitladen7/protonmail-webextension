import { emailFetcherService } from "./emailFetcherService";
import { logger } from "../helpers/logger";
import { popupTracker } from "../helpers/popupTracker";
import { backgroundStore } from "../backgroundStore";
import { rootAction } from "../../shared/store";

export class FetcherCronService {
    private pulseRunning = false;
    private alarmInterval = 1;
    private lastAlarmId = 0;
    private lastFetchInterval = -1;

    async init() {
        popupTracker.on("open", () => {
            this.pulse();
        });

        browser.alarms.onAlarm.addListener(this.onRing.bind(this));

        this.pulse();
        this.setupAlarm();
        backgroundStore.subscribe(() => {
            if (backgroundStore.getState().settings.fetchInterval !== this.lastFetchInterval) {
                this.lastFetchInterval = backgroundStore.getState().settings.fetchInterval;
                this.alarmInterval = Math.min(60, Math.max(1, Math.round(this.lastFetchInterval / 60)));
                this.setupAlarm();
            }
        });
    }

    async setupAlarm() {
        await browser.alarms.clearAll();
        const alarmName = `pulse-${++this.lastAlarmId}`;
        logger.debug(`${this.alarmInterval} minutes until next pulse (${alarmName})`);
        browser.alarms.create(alarmName, {
            delayInMinutes: this.alarmInterval,
        });
    }

    async pulse() {
        try {
            if (this.pulseRunning) {
                return;
            }

            backgroundStore.dispatch(rootAction.ui.setUI({
                syncing: true,
            }));
            this.pulseRunning = true;

            await emailFetcherService.pulse();
        } catch (error) {
            logger.error(error);
        }
        backgroundStore.dispatch(rootAction.ui.setUI({
            syncing: false,
        }));
        this.pulseRunning = false;
    }

    async onRing(alarm: browser.alarms.Alarm) {
        if (!alarm.name.startsWith("pulse")) {
            return;
        }

        if (alarm.name !== `pulse-${this.lastAlarmId}`) {
            logger.debug("This should never happen");
            return;
        }

        logger.debug("⏰ ALARM RINGING ⏰");
        await this.pulse();
        this.setupAlarm();
    }
}

export const fetcherCronService = new FetcherCronService();
