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
            <SelectTrigger className="w-auto h-9 border-none bg-transparent hover:bg-[#F4F4F4] transition-colors gap-2 px-3 focus:ring-0 focus:ring-offset-0 group">
                <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-black opacity-35 group-hover:opacity-100 transition-opacity" />
                    <span className="text-xs font-bold text-black opacity-35 group-hover:opacity-100 transition-opacity uppercase">
                        {currentLanguage.code}
                    </span>
                </div>
            </SelectTrigger>
            
            <SelectContent className="bg-white border-[#EBEBEB] shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-[16px] min-w-[140px]">
                {LANGUAGES.map((lang) => (
                    <SelectItem 
                        key={lang.code} 
                        value={lang.code} 
                        className="cursor-pointer focus:bg-[#F4F4F4] rounded-[8px] mx-1 my-0.5"
                    >
                        <div className="flex items-center gap-3">
                            <img src={lang.flag} alt="" className="w-4 h-3 object-cover rounded-[2px]" />
                            <span className="text-sm font-medium">{lang.fullLabel}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}