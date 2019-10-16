import { ActionType } from "typesafe-actions";
import { SET_UI, IUIState, LOAD_UI } from "./types";
import * as actions from "./actions";

export const defaultUI: IUIState = {
    loading: true,
    displayHidden: false,
    showingSettings: false,
    editingAccountEmail: "",
    showIncognitoModeWarning: false,
    dissmissedIncognitoModeWarning: false,
    showContainersWarning: false,
    dissmissedContainersWarning: false,
    syncing: false,
};

const initialState: IUIState =
    process.env.NODE_ENV === "development" ?
        {
            ...defaultUI, showIncognitoModeWarning: true, showContainersWarning: true,
        } :
        defaultUI;

export type UIAction = ActionType<typeof actions>;

export function uiReducer(
    state = initialState,
    action: UIAction
): IUIState {
    switch (action.type) {
        case LOAD_UI:
            return action.payload.ui;

        case SET_UI:
            return {
                ...state, ...action.payload.obj,
            };

        default:
            return state;
    }
}
