import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SearchBar } from './search-bar';
import { useTranslate } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    id: number;
    slug: string;
    name: string;
    description: string;
    images: string[];
    purity?: string;
    sku?: string;
    color?: string;
}

export function HeroSection({ products = [] }: { products: Product[] }) {
    const { __ } = useTranslate();
    
    // 1. DYNAMISME TOTAL : On prend tous les produits valides sans exception
    const items = useMemo(() => {
        return products.filter(p => p && p.id);
    }, [products]);

    const [index, setIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef(0);

    // 2. CYCLE DE DÉFILEMENT AUTO-ADAPTATIF
    useEffect(() => {
        // Si aucun produit ou un seul, on ne lance pas le timer de défilement
        if (items.length < 2) {
            setProgress(0);
            return;
        }

        const duration = 5000; // Temps d'exposition par produit
        const step = 50; 
        const increment = (step / duration) * 100;

        const timer = setInterval(() => {
            progressRef.current += increment;
            
            if (progressRef.current >= 100) {
                progressRef.current = 0;
                // Le modulo (%) items.length rend la boucle infinie peu importe le nombre
                setIndex((prev) => (prev + 1) % items.length);
            }
            
            setProgress(progressRef.current);
        }, step);

        return () => {
            clearInterval(timer);
            progressRef.current = 0;
        };
    }, [items.length]); // Réagit si la liste de produits change (ex: ajout en admin)

    if (items.length === 0) return null;

    const activeProduct = items[index];
    // On utilise la couleur du produit si elle existe, sinon le noir/primaire du thème
    const accentColor = activeProduct.color || 'var(--primary)';

    const displayImage = useMemo(() => {
        const img = activeProduct.images?.[0];
        if (!img) return '/placeholder.png';
        return img.startsWith('http') ? img : `/storage/${img}`;
    }, [activeProduct]);

    return (
        <section className="relative h-[calc(100vh-72px)] w-full bg-background overflow-hidden flex flex-col items-center justify-between">
            
            {/* --- FOND RÉACTIF --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`glow-${activeProduct.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] blur-[150px] rounded-full"
                        style={{ backgroundColor: accentColor }}
                    />
                </AnimatePresence>
            </div>

            {/* --- CONTENU --- */}
            <div className="relative z-10 w-full max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 flex-1 items-center gap-12 pt-10">
                
                {/* TEXTE DYNAMIQUE */}
                <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`content-${activeProduct.id}`}
                            initial={{ x: -40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 40, opacity: 0 }}
                            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                            className="max-w-xl space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/50 border border-border backdrop-blur-sm shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-extrabold tracking-[0.3em] uppercase text-muted-foreground">
                                    {activeProduct.purity || __('New Arrival')}
                                </span>
                            </div>
                            
                            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95] min-h-[2em] flex items-center">
                                {activeProduct.name}
                            </h1>

                            <p className="text-muted-foreground text-lg md:text-2xl font-medium leading-relaxed line-clamp-3 min-h-[4em]">
                                {activeProduct.description}
                            </p>

                            <motion.button 
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-12 py-5 rounded-2xl bg-primary text-primary-foreground font-black text-xl shadow-2xl shadow-primary/30"
                            >
                                {__('Shop Now')}
                            </motion.button>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* IMAGE DYNAMIQUE (TAILLE FIXE) */}
                <div className="order-1 lg:order-2 flex justify-center items-center">
                    <div className="relative w-[300px] h-[350px] md:w-[500px] md:h-[600px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`img-${activeProduct.id}`}
                                initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                exit={{ scale: 1.2, opacity: 0, rotate: 10 }}
                                transition={{ type: "spring", stiffness: 90, damping: 15 }}
                                className="w-full h-full flex items-center justify-center"
                            >
                                <motion.img 
                                    animate={{ y: [0, -25, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    src={displayImage} 
                                    alt={activeProduct.name}
                                    className="w-full h-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.3)]"
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* --- NAVIGATION DYNAMIQUE (BAS) --- */}
            <div className="relative z-30 w-full flex flex-col items-center gap-8 pb-8">
                
                {/* Search Bar flottante */}
                <div className="w-full max-w-2xl px-6">
                    <div className="bg-card/90 backdrop-blur-xl p-2 rounded-[2.5rem] shadow-2xl border border-border/50 group focus-within:border-primary transition-all">
                        <SearchBar placeholder={__('Search products...')} />
                    </div>
                </div>

                {/* Indicateurs : S'adaptent au nombre de produits (n barres pour n produits) */}
                <div className="flex gap-3 px-4 flex-wrap justify-center">
                    {items.map((_, i) => (
                        <button 
                            key={`nav-${i}`} 
                            className="h-1.5 bg-muted rounded-full overflow-hidden relative transition-all duration-300"
                            style={{ width: i === index ? '60px' : '30px' }} // La barre active est plus longue
                            onClick={() => {
                                setIndex(i);
                                progressRef.current = 0;
                                setProgress(0);
                            }}
                        >
                            {i === index ? (
                                <motion.div 
                                    className="absolute inset-0 bg-primary shadow-[0_0_10px_var(--primary)]"
                                    style={{ width: `${progress}%` }}
                                />
                            ) : (
                                <div className={`h-full ${i < index ? 'bg-primary/40' : ''}`} />
                            )}
                        </button>
                    ))}
                </div>

                {/* Scroll Indicator */}
                <div className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                    <div className="w-[24px] h-[40px] rounded-full border-2 border-foreground/20 flex justify-center p-1.5">
                        <motion.div 
                            animate={{ y: [0, 14, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}