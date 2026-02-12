import { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, X, Package, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslate } from '@/lib/i18n';
import { router, Link } from '@inertiajs/react';
import axios from 'axios'; 
import shop from '@/routes/shop';

interface SearchBarProps {
    initialValue?: string;
    className?: string;
}

export function SearchBar({ initialValue = '', className }: SearchBarProps) {
    const { __ } = useTranslate();
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // SYNCHRONISATION : Si l'URL change ailleurs, l'input se met à jour
    useEffect(() => {
        setQuery(initialValue || '');
    }, [initialValue]);

    // Fermer les suggestions au clic extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Système de suggestions (Debounce 300ms)
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.trim().length > 0) {
                setIsLoading(true);
                try {
                    const response = await axios.get(`/explore/suggestions`, {
                        params: { query: query.trim() }
                    });
                    setSuggestions(response.data);
                    setIsOpen(true);
                } catch (e) {
                    console.error("Erreur suggestions", e);
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
        };

        const timerId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timerId);
    }, [query]);

    // LOGIQUE DE RECHERCHE : Gère l'URL et les filtres
    const handleSearch = (overrideQuery?: string) => {
        const searchTerm = typeof overrideQuery === 'string' ? overrideQuery : query;
        
        const urlParams = new URLSearchParams(window.location.search);
        const params: Record<string, any> = Object.fromEntries(urlParams.entries());

        if (!searchTerm.trim()) {
            delete params.search;
        } else {
            params.search = searchTerm.trim();
            params.page = 1; 
        }

        router.get(shop.index.url(), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
        
        setIsOpen(false);
    };

    const highlightMatch = (text: string, highlight: string) => {
        if (!highlight.trim()) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) => 
                    part.toLowerCase() === highlight.toLowerCase() 
                        ? <span key={i} className="text-primary font-bold">{part}</span> 
                        : part
                )}
            </span>
        );
    };

    return (
        <div ref={containerRef} className={cn("relative w-full group z-50", className)}>
            <div className="relative flex items-center">
                {/* Icône de recherche / chargement */}
                <div className="absolute left-4 text-muted-foreground z-10">
                    {isLoading ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                    ) : (
                        <Search className="size-4 group-focus-within:text-primary transition-colors" />
                    )}
                </div>

                {/* Champ de saisie principal */}
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    onFocus={() => query.length > 0 && setIsOpen(true)}
                    placeholder={__('Search products...')}
                    className={cn(
                        // CORRECTION : Hauteur et padding ajustés pour un meilleur équilibre
                        "w-full h-12 pl-12 pr-24 rounded-full border-none bg-secondary/50 focus:bg-background transition-all", 
                        "text-base text-foreground placeholder:text-muted-foreground shadow-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                />
                
                {/* Boutons à droite (Effacer et Rechercher) */}
                <div className="absolute right-1.5 flex items-center gap-1">
                    {query && (
                        <button 
                            type="button"
                            onClick={() => { 
                                setQuery(''); 
                                setSuggestions([]); 
                                handleSearch('');
                            }}
                            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-full"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                    
                    <button 
                        onClick={() => handleSearch()}
                        className={cn(
                            // CORRECTION : Taille du bouton réduite
                            "size-8 m-0.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all active:scale-95",
                            query ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                        )}
                    >
                        <ArrowRight className="size-4" />
                    </button>
                </div>
            </div>

            {/* Dropdown des suggestions */}
            {isOpen && query.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-popover rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                        {suggestions.length > 0 ? (
                            <>
                                <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    {__('Suggestions')}
                                </p>
                                {suggestions.map((p) => (
                                    <Link
                                        key={p.id}
                                        href={shop.product.show.url(p.slug || p.id)}
                                        className="flex items-center gap-4 p-3 hover:bg-muted rounded-xl transition-colors group/item"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="size-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0 border border-border">
                                            <img 
                                                src={p.image ? `/storage/${p.image}` : '/img/logo.png'} 
                                                className="size-full object-cover group-hover/item:scale-110 transition-transform duration-300" 
                                                alt=""
                                                onError={(e) => { (e.target as HTMLImageElement).src = '/img/logo.png' }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-foreground font-bold truncate text-sm">
                                                {highlightMatch(p.name, query)}
                                            </h4>
                                            <p className="text-muted-foreground text-xs flex items-center gap-2">
                                                <span className="text-primary font-semibold">{p.price}$</span>
                                                {p.category && <span>• {p.category}</span>}
                                            </p>
                                        </div>
                                        <ArrowRight className="size-4 text-primary opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                                    </Link>
                                ))}
                            </>
                        ) : !isLoading && (
                            <div className="p-8 text-center">
                                <Package className="size-8 text-muted/30 mx-auto mb-2" />
                                <p className="text-muted-foreground text-sm">{__('No products found')}</p>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => handleSearch()}
                        className="w-full py-4 bg-muted/50 border-t border-border text-foreground text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-colors uppercase tracking-tight"
                    >
                        {__('See all results for')} "{query}"
                    </button>
                </div>
            )}
        </div>
    );
}