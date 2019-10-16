import { action } from "typesafe-actions";
import { SET_PEEK, IPeekState, LOAD_PEEK, CLEAR_PEEK, PEEK_MARK_AS_READ } from "./types";

export const setPeek = (peekState: Partial<IPeekState>) => action(SET_PEEK, {
    peekState,
});

export const loadPeek = (peekState: IPeekState) => action(LOAD_PEEK, {
    peekState,
});

export const clearPeek = () => action(CLEAR_PEEK, {});

export const markPeekAsRead = (id: number[]) => action(PEEK_MARK_AS_READ, {
    id,
});
