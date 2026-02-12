// src/components/language-switcher.tsx

import React from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
} from "@/components/ui/select";
import { Globe } from 'lucide-react';
import * as Routes from '@/routes'; 
import { cn } from '@/lib/utils';

const LANGUAGES = [
    { code: 'fr', label: 'FR', fullLabel: 'Français', flag: "https://flagcdn.com/24x18/fr.png" },
    { code: 'en', label: 'EN', fullLabel: 'English', flag: "https://flagcdn.com/24x18/gb.png" },
    { code: 'ru', label: 'RU', fullLabel: 'Русский', flag: "https://flagcdn.com/24x18/ru.png" },
    { code: 'zh', label: 'ZH', fullLabel: '中文', flag: "https://flagcdn.com/24x18/cn.png" },
    { code: 'ar', label: 'AR', fullLabel: 'العربية', flag: "https://flagcdn.com/24x18/sa.png" },
];

export default function LanguageSwitcher() {
    const { locale } = usePage<any>().props;
    const handleLanguageChange = (newLocale: string) => {
        router.post(Routes.change_language.url(), { locale: newLocale }, {
            preserveScroll: true,
        });
    };

    const currentLanguage = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

    return (
        <Select defaultValue={locale} onValueChange={handleLanguageChange}>
            {/* 
              TRIGGER MOBILE: 
              - Bouton circulaire, icône seule.
              - `lg:hidden` pour n'afficher que sur mobile.
            */}
            <SelectTrigger 
                className="lg:hidden w-10 h-10 p-0 border-none bg-transparent hover:bg-muted rounded-full flex items-center justify-center focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Changer la langue"
            >
                <Globe className="h-5 w-5 text-muted-foreground" />
            </SelectTrigger>

            {/* 
              TRIGGER DESKTOP: 
              - Design original avec texte.
              - `hidden lg:flex` pour n'afficher que sur desktop.
            */}
            <SelectTrigger className="hidden lg:flex w-auto h-10 border-none bg-transparent hover:bg-muted transition-colors gap-2 px-3 rounded-lg focus:ring-2 focus:ring-ring focus:ring-offset-0">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-bold text-muted-foreground uppercase">
                    {currentLanguage.label}
                </span>
            </SelectTrigger>
            
            <SelectContent align="end" className="bg-popover border-border shadow-lg rounded-xl min-w-[160px]">
                {LANGUAGES.map((lang) => (
                    <SelectItem 
                        key={lang.code} 
                        value={lang.code} 
                        className="cursor-pointer focus:bg-accent rounded-lg mx-1 my-0.5"
                    >
                        <div className="flex items-center gap-3">
                            <img src={lang.flag} alt="" className="w-5 h-4 object-cover rounded-sm" />
                            <span className="text-sm font-medium">{lang.fullLabel}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}