import React, { useState, useEffect } from 'react';
import { SearchBar } from './search-bar';
import { useTranslate } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';

const PRODUCTS = [
    { 
        id: 1, 
        name: 'Ethanol Absolute', 
        formula: 'C₂H₆O', 
        desc: 'Ultra-pure solvent for molecular biology and precise HPLC analysis.', 
        color: '#4524DB', 
        image: 'https://images.unsplash.com/photo-1581093583449-80d50ad9df23?auto=format&fit=crop&q=80&w=400', // Exemple flacon
        purity: '99.9%' 
    },
    { 
        id: 2, 
        name: 'Sulfuric Acid', 
        formula: 'H₂SO₄', 
        desc: 'Premium analytical reagent designed for complex titration workflows.', 
        color: '#E11D48', 
        image: 'https://images.unsplash.com/photo-1581093196277-9f608e1ce52a?auto=format&fit=crop&q=80&w=400',
        purity: '98.0%' 
    },
    { 
        id: 3, 
        name: 'Silver Nitrate', 
        formula: 'AgNO₃', 
        desc: 'High-sensitivity grade ideal for protein staining and photography.', 
        color: '#0EA5E9', 
        image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&q=80&w=400',
        purity: '99.5%' 
    },
    { 
        id: 4, 
        name: 'Magnesium Sulfate', 
        formula: 'MgSO₄', 
        desc: 'Expertly dried anhydrous reagent for organic synthesis drying.', 
        color: '#10B981', 
        image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=400',
        purity: '99.0%' 
    },
    { 
        id: 5, 
        name: 'Sodium Hydroxide', 
        formula: 'NaOH', 
        desc: 'Consistent pellets for precise pH stabilization in critical buffers.', 
        color: '#F59E0B', 
        image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=400',
        purity: '97.5%' 
    },
];

export function HeroSection() {
    const { __ } = useTranslate();
    const [index, setIndex] = useState(0);

    // Cycle automatique de 3 secondes
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % PRODUCTS.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const activeProduct = PRODUCTS[index];

    return (
        <section className="relative h-[100svh] w-full bg-[#FBFBFB] overflow-hidden flex flex-col items-center justify-center">
            
            {/* Background Texture & Soft Glow */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(to right, #4524DB 1px, transparent 1px), linear-gradient(to bottom, #4524DB 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
                <motion.div 
                    animate={{ backgroundColor: activeProduct.color }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] blur-[150px] rounded-full opacity-[0.04] transition-colors duration-1000" 
                />
            </div>

            {/* Logo Statut / Badge */}
            <div className="absolute top-12 z-30 flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#4524DB] font-black">PrimeLab Reagents</span>
                <div className="h-px w-12 bg-[#4524DB]/20 mt-2" />
            </div>

            {/* Central Product Showcase */}
            <div className="relative z-20 flex-1 w-full flex items-center justify-center pt-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeProduct.id}
                        initial={{ x: 200, opacity: 0, filter: 'blur(10px)' }}
                        animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                        exit={{ x: -200, opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        className="flex flex-col items-center"
                    >
                        {/* Flacon Image Container */}
                        <motion.div 
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="relative w-64 h-80 md:w-80 md:h-[450px] flex items-center justify-center"
                        >
                            {/* Glow arrière image */}
                            <div className="absolute inset-0 bg-white rounded-full blur-3xl opacity-50 scale-75" />
                            
                            <img 
                                src={activeProduct.image} 
                                alt={activeProduct.name}
                                className="relative z-10 w-full h-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.15)]"
                            />

                            {/* Info Badge Flottant */}
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="absolute top-10 -right-10 bg-white border border-black/5 shadow-xl p-4 rounded-2xl rotate-12"
                            >
                                <p className="text-[10px] font-black uppercase text-[#4524DB] leading-none mb-1">Grade</p>
                                <p className="text-sm font-bold text-black italic">Analytical</p>
                            </motion.div>
                        </motion.div>

                        {/* Product Text Description */}
                        <div className="mt-8 text-center max-w-xl px-6">
                            <motion.h2 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-4xl md:text-5xl font-bold text-black tracking-tighter mb-2"
                            >
                                {activeProduct.name}
                            </motion.h2>
                            <motion.p 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-[#4524DB] font-mono font-bold text-lg mb-4"
                            >
                                {activeProduct.formula} — {activeProduct.purity}
                            </motion.p>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                transition={{ delay: 0.2 }}
                                className="text-black leading-relaxed font-light text-base md:text-lg"
                            >
                                {activeProduct.desc}
                            </motion.p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Search Bar Area */}
            <div className="relative z-30 w-full max-w-[680px] px-6 pb-12">
                <motion.div 
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/80 backdrop-blur-2xl rounded-[32px] p-2 shadow-[0_25px_50px_-12px_rgba(69,36,219,0.2)] border border-white outline outline-1 outline-black/[0.03]"
                >
                    <SearchBar placeholder={__('Search 12,000+ compounds by CAS or name...')} />
                </motion.div>
            </div>

            {/* Custom Pagination Line */}
            <div className="absolute bottom-6 flex gap-3">
                {PRODUCTS.map((_, i) => (
                    <motion.div 
                        key={i} 
                        className="h-1 rounded-full bg-[#4524DB]"
                        animate={{ 
                            width: i === index ? 32 : 8,
                            opacity: i === index ? 1 : 0.2
                        }}
                    />
                ))}
            </div>
        </section>
    );
}