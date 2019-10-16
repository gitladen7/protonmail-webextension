import { combineReducers, AnyAction } from "redux";
import { ActionType } from "typesafe-actions";

import { uiReducer } from "./ui/reducers";
import { accountsReducer } from "./accounts/reducers";
import { settingsReducer } from "./settings/reducers";
import { peekReducer } from "./peek/reducers";

import * as uiActions from "./ui/actions";
import * as accountsActions from "./accounts/actions";
import * as settingsActions from "./settings/actions";
import * as peekActions from "./peek/actions";
import * as globalActions from "./global/actions";
import { globalReducer } from "./global/reducers";

export const rootAction = {
    ui: uiActions,
    accounts: accountsActions,
    settings: settingsActions,
    peek: peekActions,
    global: globalActions,
};

export type RootActionProps =
    typeof rootAction.accounts &
    typeof rootAction.ui &
    typeof rootAction.settings &
    typeof rootAction.peek &
    typeof rootAction.global;

export type RootAction = ActionType<typeof rootAction>;

const combinedReducer = combineReducers({
    ui: uiReducer,
    accounts: accountsReducer,
    settings: settingsReducer,
    peek: peekReducer,
});

export const rootReducer = (state: any, action: AnyAction) => {
    return combinedReducer(globalReducer(state, action), action);
};

export type AppState = ReturnType<typeof rootReducer>;
