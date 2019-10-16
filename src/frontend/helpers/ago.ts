import { _ } from "../../shared/i18n";

export const ago = (date: Date) => {
    const diff = (Date.now() - date.getTime()) / 1000;

    if (diff < 60) {
        return _("ago_now");
    }

    if (diff < 3600) {
        const minutes = `${Math.round(diff / 60)}`;
        return _(minutes === "1" ? "ago_minute" : "ago_minutes", [minutes]);
    }

    if (diff < 3600 * 24) {
        const hours = `${Math.round(diff / 3600)}`;
        return _(hours === "1" ? "ago_hour" : "ago_hours", [hours]);
    }

    if (diff < 3600 * 24 * 30) {
        const days = `${Math.round(diff / 3600 / 24)}`;
        return _(days === "1" ? "ago_day" : "ago_days", [days]);
    }

    if (diff < 3600 * 24 * 365) {
        const months = `${Math.round(diff / 3600 / 24 / 30)}`;
        return _(months === "1" ? "ago_month" : "ago_months", [months]);
    }

    const years = `${Math.round(diff / 3600 / 24 / 265)}`;
    return _(years === "1" ? "ago_year" : "ago_years", [years]);
};
