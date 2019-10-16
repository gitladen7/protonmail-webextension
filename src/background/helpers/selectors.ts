import { ISession, IProtonAccount } from "../../shared/store/accounts/types";
import { backgroundStore } from "../backgroundStore";

export const selectAccount = (email: string): IProtonAccount | undefined => {
    return backgroundStore.getState().accounts.find((s) => s.email === email);
};

export const selectSession = (uid: string): ISession | undefined => {
    const sessions = backgroundStore.getState().accounts;
    for (const session of sessions) {
        const found = session.sessions.find((s) => s.uid === uid);
        if (found !== undefined) {
            return found;
        }
    }
    return undefined;
};
