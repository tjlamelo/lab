// resources/js/types/index.ts

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

// Types pour la page de checkout
export interface AddressData {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    country: string;
    state: string;
    city: string;
    zip_code: string;
    street: string; // Changé de 'address' à 'street'
    apartment: string;
    company: string;
}

export interface CheckoutFormData {
    payment_method_id: string;
    shipping_address: AddressData;
    billing_address: AddressData & { same_as_shipping: boolean };
    shipping_method: string;
    notes: string;
    payment_proof: File | null;
}

export interface PaymentMethod {
    id: number;
    name: string | Record<string, string>;
    instructions: string | Record<string, string> | null;
    payment_details: Record<string, string> | null;
    slug: string;
    logo: string | null;
}

export interface CartItem {
    name: string;
    price: number;
    quantity: number;
}

export interface CartData {
    items: CartItem[];
    total: number;
    count: number;
}

export interface ShippingMethod {
    id: string;
    name: string;
    price: number;
    days: string;
}

export interface Country {
    code: string;
    name: string;
}