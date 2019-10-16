import { ActionType } from "typesafe-actions";
import { ISettings, SET_SETTINGS, LOAD_SETTINGS } from "./types";
import * as actions from "./actions";

export const defaultSettings: ISettings = {
    language: "en",
    preferredDomain: "mail.protonmail.com",
    fetchInterval: 1 * 60,
    singleNotificationTitle: "",
    singleNotificationMessage: "",
    multipleNotificationTitle: "",
    multipleNotificationMessage: "",
    useLightIcon: false,
    darkTheme: false,
};

const initialState: ISettings = defaultSettings;

export type SettingsActions = ActionType<typeof actions>;

export function settingsReducer(
    state = initialState,
    action: SettingsActions
): ISettings {
    switch (action.type) {
        case LOAD_SETTINGS:
            return action.payload.settings;

        case SET_SETTINGS:
            return {
                ...state, ...action.payload.obj,
            };

        default:
            return state;
    }
}
