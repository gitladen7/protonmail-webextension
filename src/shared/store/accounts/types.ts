export interface ISession {
    domain: string;
    email: string;
    uid: string;
    sharedSessionObject: ISharedSessionObject;
    accessTokenCookie: string;
    refreshTokenCookie: string;
}

export interface ISharedSessionObject {
    windowName: string;
    sessionStorage: any;
    email: string;
}

export interface IProtonAccount {
    email: string;
    persist: boolean;
    persistToDisk: boolean;
    showUnreadCountBadge: boolean;
    notify: boolean;
    hidden: boolean;
    sessions: ISession[];
    viewMode: number;
    peeking: boolean;
    unreadCount: number;
    sessionExpired: boolean;
}

export const ADD_ACCOUNT = "ADD_ACCOUNT";
export const EDIT_ACCOUNT = "EDIT_ACCOUNT";
export const DELETE_ACCOUNT = "DELETE_ACCOUNT";
export const LOAD_ACCOUNTS = "LOAD_ACCOUNTS";
export const REMOVE_SESSION_FROM_ACCOUNT = "REMOVE_SESSION_FROM_ACCOUNT";
export const EDIT_SESSION_FROM_ACCOUNT = "EDIT_SESSION_FROM_ACCOUNT";
export const ADD_SESSION_TO_ACCOUNT = "ADD_SESSION_TO_ACCOUNT";
