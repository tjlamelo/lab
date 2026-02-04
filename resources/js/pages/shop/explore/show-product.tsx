import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useTranslate } from '@/lib/i18n'; // On importe le hook de traduction
import ShopLayout from '@/layouts/shop/shop-layout';

interface ProductShowProps {
    product: any;
}

export default function ShowProduct({ product }: ProductShowProps) {
    const { __ } = useTranslate(); // On récupère la fonction de traduction ici

    // --- UTILITAIRE LOCAL : On définit ensureString ici ---
    const ensureString = (val: any): string => {
        if (typeof val === 'string') return val;
        if (val && typeof val === 'object') {
            const values = Object.values(val);
            return values.length > 0 ? String(values[0]) : '';
        }
        return '';
    };

    const images = product.images && product.images.length > 0 
        ? product.images 
        : ['/img/logo.png'];

    const [mainImage, setMainImage] = useState(images[0]);

    return (
        <ShopLayout>
            <div className="min-h-screen bg-white pb-20">
                <Head title={ensureString(product.name)} />

                <div className="max-w-[1400px] mx-auto px-4 pt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        
                        {/* --- GAUCHE : GALERIE --- */}
                        <div className="space-y-4">
                            <div className="relative aspect-square w-full overflow-hidden rounded-[3rem] bg-[#f6f6f6] shadow-sm ring-1 ring-black/5">
                                <img 
                                    src={mainImage.startsWith('/') ? mainImage : `/storage/${mainImage}`}
                                    alt={ensureString(product.name)}
                                    className="size-full object-cover transition-all duration-700"
                                />
                                <div className="absolute top-6 right-6 bg-black text-white px-4 py-2 rounded-full font-black text-lg">
                                    {product.price}€
                                </div>
                            </div>

                            {images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {images.map((img: string, i: number) => (
                                        <button 
                                            key={i}
                                            onClick={() => setMainImage(img)}
                                            className={`relative flex-shrink-0 w-24 h-24 rounded-[1.5rem] overflow-hidden border-2 transition-all ${
                                                mainImage === img ? 'border-primary shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            <img 
                                                src={img.startsWith('/') ? img : `/storage/${img}`} 
                                                className="size-full object-cover"
                                                alt="Thumbnail"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- DROITE : INFOS --- */}
                        <div className="flex flex-col space-y-8 py-4">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                               {ensureString(product.category?.name) || 'Collection'}
                                    </span>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-none">
                                {ensureString(product.name)}
                                </h1>
                                
                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.2em]">
                                            {product.unit ? `${__('Per')} ${ensureString(product.unit)}` : 'PrimeLab Exclusive'}
                             
                                    
                                </p>
                            </div>

                            <div className="space-y-4 border-t border-border pt-8">
                                <h3 className="font-black uppercase text-xs tracking-widest text-primary">Description</h3>
                                <div className="text-muted-foreground leading-relaxed text-lg max-w-xl">
                                    {product.description ? (
                                        <p>{ensureString(product.description)}</p>
                                    ) : (
                                        <p className="italic opacity-50 text-sm">Aucune description disponible.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6 pt-4">
                                <div className="flex items-center gap-4">
                                    <button className="flex-1 bg-black text-white h-16 rounded-full font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-xl shadow-black/10">
                                        {__('Add to cart')}
                                    </button>
                                    <button className="w-16 h-16 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        En Stock
                                    </div>
                                    <div className="flex items-center gap-2 text-primary">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                                        Qualité Labo
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}