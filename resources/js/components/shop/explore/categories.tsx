import React, { useState } from 'react';

interface Category {
    id: number;
    name: any;
    image?: string;
    slug: string;
}

interface CategoriesProps {
    categories: Category[];
    activeId: number | null;
    onSelect: (id: number | null) => void;
    ensureString: (val: any) => string;
}

export function Categories({ categories, activeId, onSelect, ensureString }: CategoriesProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const defaultImage = '/img/logo.png';
    
    // Nombre de catégories à afficher avant le "Voir plus"
    const INITIAL_DISPLAY_COUNT = 5; 
    const displayedCategories = isExpanded ? categories : categories.slice(0, INITIAL_DISPLAY_COUNT);
    const hasMore = categories.length > INITIAL_DISPLAY_COUNT;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-black uppercase text-[10px] tracking-[0.2em] text-primary">
                    Explore Categories
                </h3>
                {hasMore && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                    >
                        {isExpanded ? '[ Show Less ]' : `[ Show All ${categories.length} ]`}
                    </button>
                )}
            </div>
            
            <div className="flex flex-wrap -mx-2 gap-y-4">
                {/* Tuile "Tous les produits" - Toujours visible */}
                <div className="px-2 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6">
                    <button 
                        onClick={() => onSelect(null)}
                        className={`group relative flex w-full overflow-hidden border border-border h-[80px] md:h-[100px] rounded-2xl transition-all ${
                            !activeId ? 'ring-2 ring-primary border-transparent shadow-lg' : 'hover:border-primary/50'
                        }`}
                    >
                        <div className="absolute inset-0 z-10 flex items-center justify-center p-2 text-center bg-black/40 group-hover:bg-black/20 transition-colors">
                            <p className="font-black text-white uppercase text-[10px] md:text-xs tracking-widest drop-shadow-md">All Items</p>
                        </div>
                        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                            <img className="h-full w-full object-cover grayscale opacity-50" alt="all" src={defaultImage} />
                        </div>
                        <div className="flex-1 bg-muted/50"></div>
                    </button>
                </div>

                {/* Tuiles des catégories filtrées */}
                {displayedCategories.map((cat) => (
                    <div key={cat.id} className="px-2 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <button 
                            onClick={() => onSelect(cat.id)}
                            className={`group relative flex w-full overflow-hidden border border-border h-[80px] md:h-[100px] rounded-2xl transition-all ${
                                activeId == cat.id ? 'ring-2 ring-primary border-transparent shadow-lg' : 'hover:border-primary/50'
                            }`}
                        >
                            <div className="absolute inset-0 z-10 flex items-center justify-center p-2 text-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                <p className="font-black text-white uppercase text-[10px] md:text-xs tracking-widest drop-shadow-md">
                                    {ensureString(cat.name)}
                                </p>
                            </div>
                            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                                <img 
                                    className="h-full w-full object-cover" 
                                    alt={cat.slug} 
                                    src={cat.image ? `/storage/${cat.image}` : defaultImage} 
                                />
                            </div>
                            <div className="flex-1 bg-secondary/10"></div>
                        </button>
                    </div>
                ))}

                {/* Bouton "More" visuel si non développé (Optionnel) */}
                {!isExpanded && hasMore && (
                    <div className="px-2 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6">
                        <button 
                            onClick={() => setIsExpanded(true)}
                            className="flex flex-col items-center justify-center w-full h-[80px] md:h-[100px] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">+ {categories.length - INITIAL_DISPLAY_COUNT} More</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}