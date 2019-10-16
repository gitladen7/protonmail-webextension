import { ActionType } from "typesafe-actions";
import { SET_PEEK, LOAD_PEEK, IPeekState, CLEAR_PEEK, PEEK_MARK_AS_READ } from "./types";
import * as actions from "./actions";

export const defaultPeekState: IPeekState = process.env.NODE_ENV === "development" ?
    {
        loading: false,
        email: "",
        error: "",
        messages:
            [0, 1, 2, 3, 4, 5, 6, 7].map((n) => {
                return {
                    id: n,
                    protonId: "",
                    protonConvId: "",
                    date: Date.now() - 3600 * 1000 * 5 * n,
                    subject: n === 0 ? "short subject" : `this is a ${
                        [...Array(n).keys() as any].map(() => "very long").join(" ")} message (${n}) subject from the default peek state `,
                    from: `blah${n}@gmail.com`,
                    read: false,
                };
            }),
        total: 10,
    } : {
        loading: true,
        email: "",
        error: "",
        messages: [],
        total: 0,
    };

const initialState: IPeekState = defaultPeekState;

export type PeekActions = ActionType<typeof actions>;

export function peekReducer(
    state = initialState,
    action: PeekActions
): IPeekState {
    switch (action.type) {
        case LOAD_PEEK:
            return action.payload.peekState;

        case SET_PEEK:
            return {
                ...state, ...action.payload.peekState,
            };

        case CLEAR_PEEK:
            return initialState;

        case PEEK_MARK_AS_READ:
            // eslint-disable-next-line no-case-declarations
            let stateCopy = {
                ...state,
            };
            for (const id of action.payload.id) {
                const messageIndex = stateCopy.messages.findIndex((m) => m.id === id);
                stateCopy = {
                    ...stateCopy, messages: [
                        ...stateCopy.messages.slice(0, messageIndex),
                        {
                            ...stateCopy.messages[messageIndex], read: true,
                        },
                        ...stateCopy.messages.slice(messageIndex + 1, stateCopy.messages.length),
                    ],
                };
            }
            return stateCopy;
        default:
            return state;
    }
}
