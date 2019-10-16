export interface IPeekMessage {
    id: number;
    protonId: string;
    protonConvId: string;
    date: number;
    read: boolean;
    subject: string;
    from: string;
    fromName?: string;
}

export interface IPeekState {
    loading: boolean;
    email: string;
    error: string;
    messages: IPeekMessage[];
    total: number;
}

export const SET_PEEK = "SET_PEEK";
export const LOAD_PEEK = "LOAD_PEEK";
export const CLEAR_PEEK = "CLEAR_PEEK";
export const PEEK_MARK_AS_READ = "PEEK_MARK_AS_READ";
