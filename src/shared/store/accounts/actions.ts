import { action } from "typesafe-actions";
// eslint-disable-next-line max-len
import { EDIT_ACCOUNT, DELETE_ACCOUNT, LOAD_ACCOUNTS, REMOVE_SESSION_FROM_ACCOUNT, EDIT_SESSION_FROM_ACCOUNT, ADD_SESSION_TO_ACCOUNT, ADD_ACCOUNT } from "./types";
import { IProtonAccount, ISession } from "./types";

export const addAccount = (account: IProtonAccount) => action(ADD_ACCOUNT, {
    account,
});

export const editAccount = (email: string, account: Partial<IProtonAccount>) => action(EDIT_ACCOUNT, {
    email,
    account,
});

export const deleteAccount = (email: string) => action(DELETE_ACCOUNT, {
    email,
});

export const loadAccounts = (accounts: IProtonAccount[]) => action(LOAD_ACCOUNTS, {
    accounts,
});

export const removeSessionFromAccount = (email: string, uid: string) => action(REMOVE_SESSION_FROM_ACCOUNT, {
    email,
    uid,
});

export const editSessionFromAccount = (email: string, uid: string, session: Partial<ISession>) => action(EDIT_SESSION_FROM_ACCOUNT, {
    email,
    uid,
    session,
});

export const addSessionToAccount = (email: string, session: ISession) => action(ADD_SESSION_TO_ACCOUNT, {
    email,
    session,
});
