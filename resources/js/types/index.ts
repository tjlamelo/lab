export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
};
// Définition de l'Enum pour la sécurité des clés
export enum LanguageCode {
    EN = 'en',
    FR = 'fr',
    AR = 'ar',
    RU = 'ru',
    ZH = 'zh',
}

// Interface pour la configuration des langues dans l'UI
export interface LanguageConfig {
    code: LanguageCode;
    label: string;
    placeholder: string;
    direction?: 'ltr' | 'rtl'; // Utile pour l'Arabe (ar)
}

// Export de la liste constante pour tes formulaires et switchers
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
    { code: LanguageCode.FR, label: 'Français', placeholder: 'Ex: Éthanol 99%', direction: 'ltr' },
    { code: LanguageCode.EN, label: 'English', placeholder: 'Ex: Ethanol 99%', direction: 'ltr' },
    { code: LanguageCode.AR, label: 'العربية', placeholder: 'مثال: إيثانول 99%', direction: 'rtl' },
    { code: LanguageCode.RU, label: 'Русский', placeholder: 'Напр: Этанол 99%', direction: 'ltr' },
    { code: LanguageCode.ZH, label: '中文', placeholder: '例如：乙醇 99%', direction: 'ltr' },
];

// Type utile pour l'objet "name" du produit
export type MultilingualString = Record<LanguageCode, string>;