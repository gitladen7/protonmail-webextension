import { action } from "typesafe-actions";
import { SET_UI, IUIState, LOAD_UI } from "./types";

export const loadUI = (ui: IUIState) => action(LOAD_UI, {
    ui,
});

export const setUI = (obj: Partial<IUIState>) => action(SET_UI, {
    obj,
});
