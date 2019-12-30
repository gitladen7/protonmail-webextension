import qs from "querystring";
import { backgroundStore } from "../backgroundStore";

export function parseMailtoURL(url: string) {
    if (url.indexOf(backgroundStore.getState().settings.mailtoHandlerToken) === -1) {
        return undefined;
    }

    const emailMatch = url.match(/email=([^,]*),/);
    const email = emailMatch === null ? "" : emailMatch[1];
    const mailtoMatch = url.match(/mailto=(.*)/);
    const mailto = decodeURIComponent(mailtoMatch === null ? "" : mailtoMatch[1]).replace(/^mailto:/i, "");
    const to = mailto.replace(/\?.*/, "");
    const rest = mailto.indexOf("?") === -1 ? "" : mailto.replace(/.*?\?/, "");

    const data = qs.parse(rest);
    data.to = to;

    return {
        email,
        data,
    };
}
