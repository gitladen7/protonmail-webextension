import { action } from "typesafe-actions";
import { LOAD_GLOBAL_STATE } from "./types";
import { AppState } from "..";

export const loadGlobalState = (state: AppState) => action(LOAD_GLOBAL_STATE, {
    state,
});
