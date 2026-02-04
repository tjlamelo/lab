import React, { useState, useRef } from 'react';

interface ProductProps {
    product: any;
    ensureString: (val: any) => string;
    translate: (key: string) => string;
}

export function CardProduct({ product, ensureString, translate }: ProductProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    // Si pas d'images, on met le logo par défaut dans un tableau
    const images = product.images && product.images.length > 0 
        ? product.images 
        : ['/img/logo.png']; 

    const scrollToImage = (index: number) => {
        if (scrollRef.current) {
            const width = scrollRef.current.offsetWidth;
            scrollRef.current.scrollTo({
                left: width * index,
                behavior: 'smooth'
            });
            setCurrentIndex(index);
        }
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        const next = (currentIndex + 1) % images.length;
        scrollToImage(next);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        const prev = (currentIndex - 1 + images.length) % images.length;
        scrollToImage(prev);
    };

    return (
        <div className="flex flex-col gap-3 group cursor-pointer">
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden rounded-[2.5rem] bg-[#f6f6f6] shadow-sm ring-1 ring-black/5">
                
                {/* Scroll Container */}
             

                <div 
                    ref={scrollRef}
                    className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide focus:outline-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
                    onScroll={(e) => {
                        const target = e.currentTarget;
                        const index = Math.round(target.scrollLeft / target.offsetWidth);
                        if (index !== currentIndex) setCurrentIndex(index);
                    }}
                >
                    {images.map((img: string, i: number) => (
                        /* CORRECTION : Ajout de overflow-hidden ici pour isoler le zoom de l'image */
                        <div key={i} className="h-full w-full flex-shrink-0 snap-center select-none overflow-hidden">
                            <img 
                                src={img.startsWith('/') ? img : `/storage/${img}`} 
                                alt={`${ensureString(product.name)} - ${i}`}
                                // pointer-events-none évite aussi les conflits de drag natif
                                className="size-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                                draggable="false"
                            />
                        </div>
                    ))}
                </div>

 
                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button 
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <button 
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                    </>
                )}

                {/* Dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {images.map((_: any, i: number) => (
                            <div 
                                key={i} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    i === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                                }`} 
                            />
                        ))}
                    </div>
                )}

                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full shadow-sm z-10">
                    <span className="text-[12px] font-black text-white">{product.price}€</span>
                </div>
            </div>

            {/* Product Info */}
            <div className="px-2 space-y-1">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                        {/* On peut aussi mettre le logo ici en miniature si tu veux */}
                        <img src="/img/logo.png" className="w-full h-full object-contain p-0.5" alt="PL" />
                    </div>
                    <p className="text-[14px] font-bold text-foreground line-clamp-1 tracking-tight">
                        {ensureString(product.name)}
                    </p>
                </div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.1em] font-black">
                    {product.unit ? `${translate('Per')} ${product.unit}` : 'PrimeLab Solutions'}
                </p>
            </div>
        </div>
    );
}