import { createStore, applyMiddleware, AnyAction } from "redux";
import { rootReducer, rootAction } from "../shared/store";

async function wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

let id = 0;
const queue: number[] = [];

const sendToBackgroundMiddleware = (store: any) => (next: Function) => async (action: AnyAction) => {
    if (action.type.indexOf("RESPONSE") === -1 &&
        action.type.indexOf("LOAD") === -1
        && process.env.NODE_ENV !== "development") {
        const myId = id++;
        queue.push(myId);
        while (queue[0] !== myId) {
            await wait(10);
        }

        const newState = await browser.runtime.sendMessage({
            name: "PROCESS_REDUX_ACTION",
            payload: action,
        });

        queue.shift();

        return next({
            type: "LOAD_GLOBAL_STATE",
            payload: {
                state: newState,
            },
        });
    }

    return next(action);
};

export const frontendStore =
    createStore(
        rootReducer,
        undefined,
        applyMiddleware(
            sendToBackgroundMiddleware,
        )
    );

if (typeof browser !== "undefined") {
    browser.runtime.onMessage.addListener(async (obj: any) => {
        const message = obj as {
            name: string;
            payload: any;
        };
        if (message.name === "STATE_CHANGED") {
            frontendStore.dispatch(rootAction.global.loadGlobalState(message.payload));
        }
    });

    browser.runtime.connect();
}
