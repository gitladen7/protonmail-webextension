import { AnyAction } from "redux";

export const globalReducer = (state: any, action: AnyAction) => {
    if (action.type === "LOAD_GLOBAL_STATE") {
        return action.payload.state;
    }

    return state;
};
