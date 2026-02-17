import React, { useState, useRef, useEffect, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useTranslate } from '@/lib/i18n';
import ShopLayout from '@/layouts/shop/shop-layout';
import cartRoutes from '@/routes/cart'; 
import { 
    ShoppingBag, 
    Heart, 
    Minus, 
    Plus, 
    ArrowLeft, 
    CheckCircle2,
    X
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SeoHead } from '@/components/seo/seo-head';
import shop from '@/routes/shop';

interface ProductShowProps {
    product: any;
    relatedProducts?: any[];
}

export default function ShowProduct({ product, relatedProducts = [] }: ProductShowProps) {
    const { __ } = useTranslate();
    const { props } = usePage<any>();
    const locale = (props as any)?.locale || 'en';
    const [isAdding, setIsAdding] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [quantity, setQuantity] = useState('1');
    const [isEditingQuantity, setIsEditingQuantity] = useState(false);
    const quantityInputRef = useRef<HTMLInputElement>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // --- LOGIQUE DE QUANTITÉ ---
    const isWeightBased = product.unit?.toLowerCase() === 'kg';
    const step = isWeightBased ? 0.5 : 1;
    const minQuantity = step;

    // --- GESTION DES IMAGES ---
    const images = product.images && product.images.length > 0 
        ? product.images 
        : ['/img/placeholder-product.png'];

    const ensureString = (val: any): string => {
        if (typeof val === 'string') return val;
        if (val && typeof val === 'object') {
            const values = Object.values(val);
            return values.length > 0 ? String(values[0]) : '';
        }
        return '';
    };

    // --- FORMATAGE PRIX (USD) ---
    const formatUSD = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // --- SEO ---
    const meta = product.meta || {};
    const seo = meta.seo || {};

    const getLocalized = (value: any): string => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
            return (
                value[locale] ||
                value.en ||
                (Object.values(value)[0] as string) ||
                ''
            );
        }
        return '';
    };

    const seoTitle =
        getLocalized(seo.title) ||
        `${ensureString(product.name)} - PrimeLab`;

    const seoDescription =
        getLocalized(seo.description) ||
        ensureString(product.description) ||
        __('High quality chemical solutions by PrimeLab.');

    let seoKeywords: string | string[] | undefined;
    if (seo.keywords) {
        if (typeof seo.keywords === 'string') {
            seoKeywords = seo.keywords;
        } else if (typeof seo.keywords === 'object') {
            seoKeywords =
                seo.keywords[locale] ||
                seo.keywords.en ||
                (Object.values(seo.keywords)[0] as string);
        }
    }

    // Open Graph / X image & type depuis le SEO généré si disponible
    const openGraph = meta.open_graph || {};
    const xMeta = meta.x || {};

    const primaryImage = images[0];
    const fallbackImageUrl =
        typeof primaryImage === 'string'
            ? primaryImage.startsWith('http') || primaryImage.startsWith('/')
                ? primaryImage
                : `/storage/${primaryImage}`
            : '/img/placeholder-product.png';

    const imageUrl =
        openGraph.image ||
        xMeta.image ||
        fallbackImageUrl;

    const canonicalUrl =
        meta.canonical ||
        shop.product.show.url(product.slug || product.id);

    const robots = meta.robots || {};
    const robotsIndex = robots.index !== false;
    const robotsFollow = robots.follow !== false;

    const schemaForLocale = meta.schema?.[locale] || null;

    // --- GESTION DE LA QUANTITÉ ---
    const startEditingQuantity = useCallback(() => {
        setIsEditingQuantity(true);
        setTimeout(() => {
            quantityInputRef.current?.focus();
            quantityInputRef.current?.select();
        }, 0);
    }, []);

    const stopEditingQuantity = useCallback(() => {
        setIsEditingQuantity(false);
        
        // Valider la quantité
        const numValue = parseFloat(quantity);
        if (isNaN(numValue) || numValue < minQuantity) {
            setQuantity(minQuantity.toString());
        }
    }, [quantity, minQuantity]);

    const handleQuantityChange = useCallback((value: string) => {
        setQuantity(value);
        
        // Valider et mettre à jour si c'est un nombre valide
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= minQuantity) {
            // La quantité est valide
        }
    }, [minQuantity]);

    const decreaseQuantity = useCallback(() => {
        const currentQuantity = parseFloat(quantity);
        const newQuantity = Math.max(minQuantity, currentQuantity - step);
        setQuantity(newQuantity.toString());
    }, [quantity, step, minQuantity]);

    const increaseQuantity = useCallback(() => {
        const currentQuantity = parseFloat(quantity);
        const newQuantity = currentQuantity + step;
        setQuantity(newQuantity.toString());
    }, [quantity, step]);

    // --- AJOUT AU PANIER ---
    const handleAddToCart = useCallback(() => {
        setIsAdding(true);

        // Validation finale de la quantité
        const finalQuantity = parseFloat(quantity);
        if (isNaN(finalQuantity) || finalQuantity < minQuantity) {
            setIsAdding(false);
            return;
        }

        // Extraction sécurisée de l'image
        let imageToSave = '/img/placeholder-product.png';
        if (images && images.length > 0) {
            const firstImage = images[selectedImageIndex];
            imageToSave = typeof firstImage === 'object' ? (firstImage.path || firstImage.url) : firstImage;
        }

        const payload = {
            product_id: product.id,
            quantity: finalQuantity,
            price: product.price,
            product_name: ensureString(product.name),
            product_image: imageToSave,
            unit: product.unit
        };

        router.post(cartRoutes.store().url, payload, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAdding(false);
            },
            onError: (errors) => {
                console.error("Erreur lors de l'ajout :", errors);
                setIsAdding(false);
            },
            onFinish: () => setIsAdding(false)
        });
    }, [quantity, product, images, selectedImageIndex, minQuantity]);

    // --- CALCULS ---
    const currentQuantity = parseFloat(quantity) || minQuantity;
    const subtotal = product.price * currentQuantity;

    // --- TOGGLE FAVORI ---
    const toggleFavorite = useCallback(() => {
        setIsFavorited(!isFavorited);
    }, [isFavorited]);

    return (
        <ShopLayout>
            <SeoHead
                title={seoTitle}
                description={seoDescription}
                keywords={seoKeywords}
                canonicalUrl={canonicalUrl}
                imageUrl={imageUrl}
                openGraphType={openGraph.type || 'product'}
                robotsIndex={robotsIndex}
                robotsFollow={robotsFollow}
                jsonLd={schemaForLocale}
            />

            <div className="min-h-screen pb-20 bg-background">
                <div className="max-w-6xl mx-auto px-4 pt-4 md:px-6 md:pt-8">
                    {/* Breadcrumb / Back button */}
                    <Link 
                        href="/explore" 
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="size-4" />
                        {__('Back to shop')}
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
                        
                        {/* GAUCHE : GALERIE PHOTOS */}
                        <div className="space-y-4">
                            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={selectedImageIndex}
                                        src={images[selectedImageIndex].startsWith('/') || images[selectedImageIndex].startsWith('http') ? images[selectedImageIndex] : `/storage/${images[selectedImageIndex]}`}
                                        alt={ensureString(product.name)}
                                        className="size-full object-cover"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </AnimatePresence>
                                
                                {/* Badge de prix */}
                                <div className="absolute top-4 right-4 bg-card border border-border rounded-xl px-3 py-1.5 shadow-lg">
                                    <span className="text-lg font-bold text-foreground">
                                        {formatUSD(product.price)}
                                    </span>
                                    <span className="text-xs text-muted-foreground block">
                                        / {ensureString(product.unit) || 'unit'}
                                    </span>
                                </div>

                                {/* Bouton favori */}
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute top-4 left-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
                                    onClick={toggleFavorite}
                                >
                                    <Heart className={cn("h-5 w-5", isFavorited ? "fill-red-500 text-red-500" : "")} />
                                </Button>
                            </div>

                            {/* Miniatures */}
                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto">
                                    {images.map((img: string, i: number) => (
                                        <button 
                                            key={i}
                                            onClick={() => setSelectedImageIndex(i)}
                                            className={cn(
                                                "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                                                selectedImageIndex === i 
                                                    ? 'border-primary scale-95' 
                                                    : 'border-border opacity-60 hover:opacity-100'
                                            )}
                                        >
                                            <img 
                                                src={img.startsWith('/') || img.startsWith('http') ? img : `/storage/${img}`} 
                                                className="size-full object-cover"
                                                alt={`Thumbnail ${i + 1}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* DROITE : INFORMATIONS PRODUIT */}
                        <div className="space-y-6">
                            {/* Catégorie et titre */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="font-semibold text-xs">
                                        {ensureString(product.category?.name) || __('Exclusive')}
                                    </Badge>
                                    {product.is_new && (
                                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                                            {__('New')}
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                                    {ensureString(product.name)}
                                </h1>
                                
                                <p className="text-sm text-muted-foreground">
                                    {product.unit ? `${__('Unit')}: ${ensureString(product.unit)}` : __('PrimeLab Quality')}
                                </p>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg text-foreground">{__('Description')}</h3>
                                <div className="text-muted-foreground leading-relaxed">
                                    {product.description ? (
                                        <p>{ensureString(product.description)}</p>
                                    ) : (
                                        <p className="italic">{__('Detailed description arriving soon.')}</p>
                                    )}
                                </div>
                            </div>

                            {/* SÉLECTEUR DE QUANTITÉ ET SOUS-TOTAL */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-foreground">
                                        {__('Quantity')}
                                    </label>
                                    <span className="text-sm text-muted-foreground">
                                        {__('Subtotal')}: <span className="font-medium text-foreground">{formatUSD(subtotal)}</span>
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center overflow-hidden rounded-lg border border-border bg-background">
                                        <button 
                                            onClick={decreaseQuantity}
                                            className="flex h-10 w-10 items-center justify-center transition hover:bg-muted"
                                            disabled={currentQuantity <= minQuantity}
                                        >
                                            {currentQuantity > 1 ? (
                                                <Minus className="h-4 w-4" />
                                            ) : (
                                                <X className="h-4 w-4" />
                                            )}
                                        </button>
                                        
                                        <div className="w-16 text-center">
                                            {isEditingQuantity ? (
                                                <Input
                                                    ref={quantityInputRef}
                                                    type="number"
                                                    min={minQuantity}
                                                    step={step}
                                                    value={quantity}
                                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                                    onBlur={stopEditingQuantity}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            stopEditingQuantity();
                                                        }
                                                    }}
                                                    className="h-10 w-16 border-0 text-center p-0 focus-visible:ring-0"
                                                />
                                            ) : (
                                                <button
                                                    onClick={startEditingQuantity}
                                                    className="w-full h-10 font-medium tabular-nums text-foreground"
                                                >
                                                    {currentQuantity}
                                                </button>
                                            )}
                                        </div>

                                        <button 
                                            onClick={increaseQuantity}
                                            className="flex h-10 w-10 items-center justify-center transition hover:bg-muted"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    
                                    <span className="text-sm text-muted-foreground">
                                        {ensureString(product.unit) || 'unit'}
                                    </span>
                                </div>
                            </div>

                            {/* BOUTON D'AJOUT AU PANIER */}
                            <div className="pt-2">
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={isAdding}
                                    size="lg"
                                    className="h-14 w-full gap-2 text-base font-semibold transition-all"
                                >
                                    {isAdding ? (
                                        <>
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                            {__('Adding...')}
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag className="h-5 w-5" />
                                            {__('Add to cart')}
                                        </>
                                    )}
                                </Button>
                                
                                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mt-4">
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span>{__('In stock')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                        <span>{__('Quality assured')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PRODUITS APPARENTÉS - Version simplifiée */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-xl font-bold text-foreground mb-4">{__('You might also like')}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {relatedProducts.slice(0, 4).map((relatedProduct: any, i: number) => (
                                    <Link key={i} href={`/products/${relatedProduct.slug || relatedProduct.id}`}>
                                        <div className="bg-card border border-border rounded-lg overflow-hidden transition-all hover:shadow-md">
                                            <div className="aspect-square bg-muted">
                                                <img 
                                                    src={relatedProduct.image || '/img/placeholder-product.png'}
                                                    alt={ensureString(relatedProduct.name)}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-3">
                                                <h3 className="font-medium text-foreground text-sm line-clamp-1">{ensureString(relatedProduct.name)}</h3>
                                                <p className="font-bold text-foreground text-sm mt-1">{formatUSD(relatedProduct.price)}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}