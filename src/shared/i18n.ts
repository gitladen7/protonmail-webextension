import baseEnglishLocale from "../_locales/en/messages.json";

const currentCatalog: any = {};
let currentLocale = "";
export const availableLanguages = [
    {
        lang: "en",
        name: "English",
    },
    {
        lang: "es",
        name: "Español",
    },
    {
        lang: "zh_CN",
        name: "简体中文",
    },
];

export const loadLocale = async (lang: string) => {
    try {
        if (lang === currentLocale) {
            return;
        }
        currentLocale = lang;
        for (const key in baseEnglishLocale) {
            currentCatalog[key] = (baseEnglishLocale as any)[key].message;
        }

        if (lang === "en") {
            return;
        }

        const response = await fetch(`/_locales/${lang}/messages.json`);
        const translations = await response.json();
        for (const key in translations) {
            currentCatalog[key] = translations[key].message;
        }
    } catch (error) {
        // ignore
    }
};

export const _ = (s: string, substitutions?: string[]) => {
    if (substitutions !== undefined) {
        return (currentCatalog[s] || s || "missing").replace(/\$1/g, substitutions[0]);
    }

    return currentCatalog[s] || s || "missing";
};
