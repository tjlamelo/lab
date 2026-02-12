import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    ArrowLeft,
    CreditCard,
    X,
    Shield,
    Truck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslate } from '@/lib/i18n';
import cartRoutes from '@/routes/cart';
import ShopLayout from '@/layouts/shop/shop-layout';
import orders from '@/routes/orders';
import { cn } from '@/lib/utils';

interface CartItem {
    productId: number;
    quantity: number;
    price: number;
    productNameAtPurchase: string;
    productImage?: string;
    unitAtPurchase?: string;
    variant?: string;
}

interface Props {
    cart: {
        items: CartItem[];
        count: number;
        total: number;
    };
}

export default function Index({ cart }: Props) {
    const { __ } = useTranslate();
    const [removingItem, setRemovingItem] = useState<number | null>(null);
    const [updatingQuantities, setUpdatingQuantities] = useState<Set<number>>(new Set());
    const [editingQuantities, setEditingQuantities] = useState<Set<number>>(new Set());
    const [quantityValues, setQuantityValues] = useState<Record<number, string>>({});
    const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    // Initialiser les valeurs de quantité
    useEffect(() => {
        const initialValues: Record<number, string> = {};
        cart.items.forEach(item => {
            initialValues[item.productId] = item.quantity.toString();
        });
        setQuantityValues(initialValues);
    }, [cart.items]);

    const updateQuantity = useCallback((item: CartItem, newQuantity: number) => {
        if (newQuantity < 1) return;
        
        setUpdatingQuantities(prev => new Set(prev).add(item.productId));
        
        router.patch(
            cartRoutes.update(item.productId).url,
            { quantity: newQuantity },
            { 
                preserveScroll: true,
                onFinish: () => {
                    setUpdatingQuantities(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(item.productId);
                        return newSet;
                    });
                    // Mettre à jour la valeur affichée
                    setQuantityValues(prev => ({
                        ...prev,
                        [item.productId]: newQuantity.toString()
                    }));
                }
            },
        );
    }, []);

    const handleQuantityChange = useCallback((item: CartItem, value: string) => {
        // Mettre à jour la valeur affichée
        setQuantityValues(prev => ({
            ...prev,
            [item.productId]: value
        }));
        
        // Valider et mettre à jour si c'est un nombre valide
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue > 0) {
            updateQuantity(item, numValue);
        }
    }, [updateQuantity]);

    const startEditingQuantity = useCallback((productId: number) => {
        setEditingQuantities(prev => new Set(prev).add(productId));
        // Focus sur l'input et sélectionner tout le texte après un court délai
        setTimeout(() => {
            if (inputRefs.current[productId]) {
                inputRefs.current[productId]?.focus();
                inputRefs.current[productId]?.select();
            }
        }, 0);
    }, []);

    const stopEditingQuantity = useCallback((productId: number) => {
        setEditingQuantities(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
        });
        
        // Valider la quantité lorsqu'on quitte le champ
        const currentValue = quantityValues[productId];
        const numValue = parseInt(currentValue || '0', 10);
        if (!isNaN(numValue) && numValue > 0) {
            const item = cart.items.find(i => i.productId === productId);
            if (item) {
                updateQuantity(item, numValue);
            }
        } else {
            // Réinitialiser à la valeur précédente si invalide
            const item = cart.items.find(i => i.productId === productId);
            if (item) {
                setQuantityValues(prev => ({
                    ...prev,
                    [productId]: item.quantity.toString()
                }));
            }
        }
    }, [quantityValues, cart.items, updateQuantity]);

    const removeItem = useCallback((productId: number) => {
        if (!confirm(__('Remove this item?'))) return;
        setRemovingItem(productId);
        
        router.delete(cartRoutes.destroy(productId).url, {
            preserveScroll: true,
            onFinish: () => setRemovingItem(null),
        });
    }, [__]);

    const clearCart = useCallback(() => {
        if (confirm(__('Are you sure you want to empty your cart?'))) {
            router.delete(cartRoutes.clear().url);
        }
    }, []);

    const formatUSD = (val: number) => `$${val.toFixed(2)}`;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
    };

    // Fonction pour créer une référence pour un input spécifique
    const setInputRef = useCallback((productId: number) => (el: HTMLInputElement | null) => {
        inputRefs.current[productId] = el;
    }, []);

    return (
        <ShopLayout>
            <Head title={__('My Shopping Cart')} />

            <div className="min-h-screen pb-20 md:pb-8 bg-background">
                <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
                    
                    {/* Header - Aligné horizontalement avec Clear Cart à droite */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {__('Shopping Cart')}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {cart.count} {cart.count > 1 ? __('items') : __('item')} {__('in your cart')}
                            </p>
                        </div>

                        {cart.items.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-sm font-medium transition-all hover:text-destructive"
                                onClick={clearCart}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline">{__('Clear Cart')}</span>
                                <span className="sm:hidden">{__('Clear')}</span>
                            </Button>
                        )}
                    </div>

                    {cart.items.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Cart Items - Mobile First */}
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4 lg:col-span-8"
                            >
                                <AnimatePresence mode='popLayout'>
                                    {cart.items.map((item) => (
                                        <motion.div
                                            key={item.productId}
                                            variants={itemVariants}
                                            exit="exit"
                                            layout
                                            className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
                                        >
                                            <div className="p-4 md:p-6">
                                                <div className="flex gap-3 md:gap-6">
                                                    {/* Product Image */}
                                                    <Link href={`/products/${item.productId}`}>
                                                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg md:h-28 md:w-28">
                                                            {item.productImage ? (
                                                                <img 
                                                                    src={item.productImage.startsWith('/') || item.productImage.startsWith('http') ? item.productImage : `/storage/${item.productImage}`}
                                                                    alt={item.productNameAtPurchase}
                                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = "/img/placeholder-product.png";
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center bg-muted">
                                                                    <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground/30" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Link>

                                                    <div className="flex flex-1 flex-col justify-between gap-2">
                                                        <div>
                                                            <Link href={`/products/${item.productId}`}>
                                                                <h3 className="font-semibold text-base md:text-lg leading-tight line-clamp-2 hover:text-primary transition-colors text-foreground">
                                                                    {item.productNameAtPurchase}
                                                                </h3>
                                                            </Link>
                                                            {item.variant && (
                                                                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                                                    {item.variant}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between mt-3 md:mt-4">
                                                            {/* Quantity Selector with Input - Mobile First */}
                                                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
                                                                <div className="flex h-9 md:h-10 items-center overflow-hidden rounded-lg border border-border bg-background">
                                                                    {item.quantity > 1 ? (
                                                                        <button
                                                                            type="button"
                                                                            className="flex h-full w-8 md:w-10 items-center justify-center transition hover:bg-muted"
                                                                            onClick={() => updateQuantity(item, item.quantity - 1)}
                                                                            disabled={updatingQuantities.has(item.productId)}
                                                                            aria-label={__('Decrease quantity')}
                                                                        >
                                                                            <Minus className="h-4 w-4" />
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            className="flex h-full w-8 md:w-10 items-center justify-center transition hover:bg-destructive/10 hover:text-destructive"
                                                                            onClick={() => removeItem(item.productId)}
                                                                            aria-label={__('Remove item')}
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                    
                                                                    <div className="w-10 md:w-12 text-center">
                                                                        {editingQuantities.has(item.productId) ? (
                                                                            <Input
                                                                                ref={setInputRef(item.productId)}
                                                                                type="number"
                                                                                min="1"
                                                                                value={quantityValues[item.productId] || item.quantity}
                                                                                onChange={(e) => handleQuantityChange(item, e.target.value)}
                                                                                onBlur={() => stopEditingQuantity(item.productId)}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        stopEditingQuantity(item.productId);
                                                                                    }
                                                                                }}
                                                                                className="h-9 md:h-10 w-10 md:w-12 border-0 text-center p-0 focus-visible:ring-0 text-foreground"
                                                                            />
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => startEditingQuantity(item.productId)}
                                                                                className="w-full h-9 md:h-10 text-sm font-medium tabular-nums text-foreground"
                                                                            >
                                                                                {updatingQuantities.has(item.productId) ? (
                                                                                    <div className="flex justify-center">
                                                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                                                                    </div>
                                                                                ) : (
                                                                                    quantityValues[item.productId] || item.quantity
                                                                                )}
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        className="flex h-full w-8 md:w-10 items-center justify-center transition hover:bg-muted"
                                                                        onClick={() => updateQuantity(item, item.quantity + 1)}
                                                                        disabled={updatingQuantities.has(item.productId)}
                                                                        aria-label={__('Increase quantity')}
                                                                    >
                                                                        <Plus className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {item.unitAtPurchase || 'unit'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end justify-between">
                                                        <p className="font-semibold text-base md:text-lg text-foreground">
                                                            {formatUSD(item.price * item.quantity)}
                                                        </p>
                                                        <p className="text-xs md:text-sm text-muted-foreground">
                                                            {formatUSD(item.price)} / {item.unitAtPurchase || 'unit'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Continue Shopping - Mobile First */}
                                <Link 
                                    href="/explore" 
                                    className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {__('Continue Shopping')}
                                </Link>
                            </motion.div>

                            {/* Order Summary - Mobile First */}
                            <div className="lg:col-span-4">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="sticky top-20 md:top-24 space-y-6 rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm"
                                >
                                    <h2 className="text-lg md:text-xl font-bold text-foreground">
                                        {__('Order Summary')}
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {__('Subtotal')}
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {formatUSD(cart.total)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {__('Shipping')}
                                            </span>
                                            <span className="font-medium text-muted-foreground">
                                                {__('Calculated at checkout')}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {__('Tax')}
                                            </span>
                                            <span className="font-medium text-muted-foreground">
                                                {__('Calculated at checkout')}
                                            </span>
                                        </div>
                                        
                                        <div className="border-t border-border pt-4">
                                            <div className="flex justify-between">
                                                <span className="text-lg font-bold text-foreground">
                                                    {__('Total')}
                                                </span>
                                                <span className="text-xl font-bold text-primary">
                                                    {formatUSD(cart.total)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link href={orders.checkout.url()} className="block">
                                        <Button 
                                            size="lg" 
                                            className="h-12 w-full gap-2 text-base font-medium transition-all focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        >
                                            <CreditCard className="h-5 w-5" />
                                            {__('Checkout')}
                                        </Button>
                                    </Link>

                                    {/* Éléments de confiance */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Shield className="h-4 w-4 text-green-600" />
                                            <span>{__('Secure Payment')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Truck className="h-4 w-4 text-blue-600" />
                                            <span>{__('Fast Delivery')}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    ) : (
                        /* État vide - Mobile First */
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 md:p-16 text-center"
                        >
                            <div className="mb-6 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-muted">
                                <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/30" />
                            </div>
                            <h2 className="mb-2 text-xl md:text-2xl font-bold text-foreground">
                                {__('Your cart is empty')}
                            </h2>
                            <p className="mb-6 md:mb-8 max-w-md text-sm md:text-base text-muted-foreground">
                                {__('Looks like you haven\'t added anything to your cart yet. Start shopping to fill it up!')}
                            </p>
                            <Link href="/explore">
                                <Button size="lg" className="gap-2">
                                    <ShoppingBag className="h-5 w-5" />
                                    {__('Start Shopping')}
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}