import { useState, useEffect } from "react";
import { loadLocale } from "../../shared/i18n";

export function useLanguage(loading: boolean, language: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loadingLanguage, setLoadingLanguage] = useState(true);
    useEffect(() => {
        if (loading) {
            return;
        }

        setLoadingLanguage(true);
        loadLocale(language).then(() => {
            setLoadingLanguage(false);
        });
    }, [loading, language]);

    return loadingLanguage;
}
