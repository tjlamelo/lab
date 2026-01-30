import { usePage } from '@inertiajs/react';

export function useTranslate() {
    // On récupère les traductions que tu as ajoutées dans HandleInertiaRequests
    const { translations } = usePage<any>().props;

    /**
     * La fonction __ permet de traduire une clé.
     * Si la clé n'existe pas dans fr.json ou en.json, elle affiche la clé brute.
     */
    const __ = (key: string, replace: Record<string, string> = {}) => {
        let translation = translations ? translations[key] || key : key;

        // Gestion des variables (ex: "Bienvenue, :name")
        Object.keys(replace).forEach((r) => {
            translation = translation.replace(`:${r}`, replace[r]);
        });

        return translation;
    };

    return { __ };
}