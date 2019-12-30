export interface ISettings {
    language: string;
    preferredDomain: string;
    fetchInterval: number;
    singleNotificationTitle: string;
    singleNotificationMessage: string;
    multipleNotificationTitle: string;
    multipleNotificationMessage: string;
    useLightIcon: boolean;
    darkTheme: boolean;
    mailtoHandlerToken: string;
}

export const SET_SETTINGS = "SET_SETTINGS";
export const LOAD_SETTINGS = "LOAD_SETTINGS";
