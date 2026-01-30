import { useState } from 'react';
import { Search, ArrowRight, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslate } from '@/lib/i18n';

interface SearchBarProps {
    placeholder?: string;
    className?: string;
}

export function SearchBar({ placeholder, className }: SearchBarProps) {
    const { __ } = useTranslate();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const defaultPlaceholder = placeholder || __('Search products...');

    return (
        <div className={cn("relative w-full group pointer-events-auto", className)}>
            <div className="relative flex w-full items-center">
                {/* Shopify Style Search Icon */}
                <div className="absolute left-5 text-black/30 group-focus-within:text-[#4524DB] transition-colors z-10">
                    <Search className="size-5" />
                </div>

                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    placeholder={defaultPlaceholder}
                    className={cn(
                        "w-full h-14 pl-14 pr-24 rounded-full border-none bg-transparent",
                        "text-lg text-black placeholder:text-black/40 placeholder:font-normal focus-visible:ring-0"
                    )}
                />

                {/* Action Buttons: Clear (X) + Submit (Arrow) */}
                <div className="absolute right-2 flex items-center gap-2">
                    {query && (
                        <button 
                            type="button"
                            onClick={() => setQuery('')}
                            className="p-2 text-black/20 hover:text-black/50 transition-colors"
                        >
                            <X className="size-5" />
                        </button>
                    )}
                    
                    <button 
                        className={cn(
                            "size-10 flex items-center justify-center rounded-full bg-[#4524DB] text-white shadow-[0_4px_12px_rgba(69,36,219,0.3)] transition-all duration-300 active:scale-95",
                            query ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-75 translate-x-2 pointer-events-none"
                        )}
                    >
                        <ArrowRight className="size-5" />
                    </button>
                </div>
            </div>

            {/* Dark Premium Dropdown Results */}
            {isOpen && query && (
                <div className="absolute top-[calc(100%+8px)] w-full bg-[#1A1A1A] rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/10 z-50 overflow-hidden p-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 hover:bg-white/5 rounded-[14px] cursor-pointer transition-colors flex items-center gap-3">
                        <Search className="h-4 w-4 text-white/40" />
                        <span className="text-sm font-medium text-white/70">
                            {__('Search for')} <span className="font-bold text-white">"{query}"</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}