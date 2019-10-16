export interface IUIState {
    loading: boolean;
    displayHidden: boolean;
    editingAccountEmail: string;
    showingSettings: boolean;
    showIncognitoModeWarning: boolean;
    dissmissedIncognitoModeWarning: boolean;
    showContainersWarning: boolean;
    dissmissedContainersWarning: boolean;
    syncing: boolean;
}

export const SET_UI = "SET_UI";
export const LOAD_UI = "LOAD_UI";
