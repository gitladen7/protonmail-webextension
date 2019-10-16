import { action } from "typesafe-actions";
import { SET_SETTINGS, ISettings, LOAD_SETTINGS } from "./types";

export const setSettings = (obj: Partial<ISettings>) => action(SET_SETTINGS, {
    obj,
});

export const loadSettings = (settings: ISettings) => action(LOAD_SETTINGS, {
    settings,
});
