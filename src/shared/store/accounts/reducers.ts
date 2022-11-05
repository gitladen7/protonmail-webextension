import { ActionType } from "typesafe-actions";
// eslint-disable-next-line max-len
import { EDIT_ACCOUNT, DELETE_ACCOUNT, LOAD_ACCOUNTS, REMOVE_SESSION_FROM_ACCOUNT, EDIT_SESSION_FROM_ACCOUNT, ADD_SESSION_TO_ACCOUNT, ADD_ACCOUNT } from "./types";
import * as actions from "./actions";
import { IProtonAccount } from "./types";

export const defaultAccount: IProtonAccount = {
    email: "",
    persist: true,
    persistToDisk: false,
    showUnreadCountBadge: true,
    viewMode: 0,
    unreadCount: 0,
    sessionExpired: false,
    peeking: true,
    notify: true,
    hidden: false,
    sessions: [],
};

const initialState: IProtonAccount[] = process.env.NODE_ENV !== "development" ? [] :
    [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ].map((n) => {
        return {
            email: n === 3 ? "veryveryveryverylongemailaddress@protonmail.com" : `email${n}@protonmail.com`,
            showUnreadCountBadge: true,
            notify: true,
            persist: true,
            persistToDisk: false,
            persistMailboxPasswordToDisk: false,
            peeking: true,
            hidden: n === 0,
            viewMode: 0,
            sessionExpired: n === 1,
            unreadCount: n,
            sessions: n % 3 === 0 ? [
                {
                    domain: "mail.proton.me",
                    email: `email${n}@protonmail.com`,
                    uid: "uid",
                    sharedSessionObject: {
                        windowName: "",
                        sessionStorage: "",
                        email: `email${n}@protonmail.com`,
                    },
                    accessTokenCookie: "",
                    refreshTokenCookie: "",
                },
            ] : [],
        };
    });

export type UIAction = ActionType<typeof actions>;

export function accountsReducer(
    state = initialState,
    action: UIAction
): IProtonAccount[] {
    if (action.type === LOAD_ACCOUNTS) {
        return action.payload.accounts;
    }

    if (action.type === ADD_ACCOUNT) {
        return [
            ...state,
            action.payload.account,
        ];
    }

    const index = state.findIndex((s) => action.payload && s.email === action.payload.email);
    if (index === -1) {
        return state;
    }

    switch (action.type) {
        case ADD_SESSION_TO_ACCOUNT:
            return [
                ...state.slice(0, index),
                {
                    ...state[index], sessions: [
                        ...state[index].sessions,
                        action.payload.session,
                    ],
                    sessionExpired: false,
                },
                ...state.slice(index + 1, state.length),
            ];
        case EDIT_SESSION_FROM_ACCOUNT:
            // eslint-disable-next-line no-case-declarations
            const sessionIndex = state[index].sessions.findIndex((s) => s.uid === action.payload.uid);
            if (sessionIndex === -1) {
                return state;
            }

            return [
                ...state.slice(0, index),
                {
                    ...state[index], sessions: [
                        ...state[index].sessions.slice(0, sessionIndex),
                        {
                            ...state[index].sessions[sessionIndex], ...action.payload.session,
                        },
                        ...state[index].sessions.slice(sessionIndex + 1, state[index].sessions.length),
                    ],
                },
                ...state.slice(index + 1, state.length),
            ];
        case REMOVE_SESSION_FROM_ACCOUNT:
            // eslint-disable-next-line no-case-declarations
            const sessions = state[index].sessions.filter((s) => s.uid !== action.payload.uid);
            return [
                ...state.slice(0, index),
                {
                    ...state[index], sessions: sessions, sessionExpired: sessions.length === 0,
                },
                ...state.slice(index + 1, state.length),
            ];

        case EDIT_ACCOUNT:
            return [
                ...state.slice(0, index),
                {
                    ...state[index], ...action.payload.account,
                },
                ...state.slice(index + 1, state.length),
            ];

        case DELETE_ACCOUNT:
            return [
                ...state.slice(0, index),
                ...state.slice(index + 1, state.length),
            ];


        default:
            return state;
    }
}
