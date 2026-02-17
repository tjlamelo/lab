// resources/js/components/checkout/order-summary.tsx
import React from 'react';
import { CheckCircle2, Truck, Shield, Wallet, Loader2 } from 'lucide-react';
import { CartData, PaymentMethod, ShippingMethod } from '@/types';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface OrderSummaryProps {
    cart: CartData;
    selectedShippingMethod: ShippingMethod;
    paymentMethods: PaymentMethod[];
    taxAmount: number;
    finalTotal: number;
    step: number;
    onPlaceOrder: (e: React.FormEvent) => void;
    processing: boolean;
}

export default function OrderSummary({
    cart,
    selectedShippingMethod,
    paymentMethods,
    taxAmount,
    finalTotal,
    step,
    onPlaceOrder,
    processing
}: OrderSummaryProps) {
    const { __ } = useTranslate();

    const getTranslation = (field: any) => {
        const locale = 'en'; // Simplifié pour l'exemple
        if (typeof field === 'object' && field !== null) {
            return field[locale] || field['en'] || Object.values(field)[0];
        }
        return field;
    };

    return (
        <div className="hidden xl:block">
            <div className="sticky top-24 h-fit">
                <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
                    <h3 className="text-lg font-medium text-foreground">{__('Order Summary')}</h3>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{__('Subtotal')} ({cart.count} {__('items')})</span>
                            <span className="text-sm font-medium text-foreground">${cart.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{__('Shipping')}</span>
                            <span className="text-sm font-medium text-foreground">${selectedShippingMethod.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{__('Tax')}</span>
                            <span className="text-sm font-medium text-foreground">${taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-border pt-3 flex justify-between items-center">
                            <span className="font-medium text-foreground">{__('Total')}</span>
                            <span className="font-bold text-lg text-primary">${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="border-t border-border pt-4 space-y-4">
                        <div className="flex items-start gap-3 group">
                            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                <CheckCircle2 size={12} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">{__('Secure Checkout')}</p>
                                <p className="text-xs">{__('Your payment information is encrypted and secure. We never store your payment details.')}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 group">
                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                <Truck size={12} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">{__('Free Returns')}</p>
                                <p className="text-xs">{__('Enjoy hassle-free returns within 30 days of delivery.')}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 group">
                            <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                <Shield size={12} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">{__('Purchase Protection')}</p>
                                <p className="text-xs">{__('Your order is protected against fraud and misrepresentation.')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods Logos */}
                    {paymentMethods.length > 0 && (
                        <div className="border-t border-border pt-4">
                            <h4 className="text-sm font-medium text-foreground mb-3">{__('We Accept')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {paymentMethods.slice(0, 6).map((method) => (
                                    <div 
                                        key={method.id}
                                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden"
                                        title={getTranslation(method.name)}
                                    >
                                        {method.logo && (
                                            <img 
                                                src={method.logo.startsWith('http') ? method.logo : `/storage/${method.logo}`} 
                                                alt={getTranslation(method.name)}
                                                className="w-full h-full object-contain p-1"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        )}
                                        <Wallet size={14} className={cn("transition-all duration-200", method.logo ? "hidden" : "text-muted-foreground")} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <button
                            onClick={onPlaceOrder}
                            disabled={processing}
                            className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:scale-[1.02]"
                        >
                            {processing ? <Loader2 className="animate-spin" size={18} /> : __('Place Order')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}