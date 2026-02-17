// resources/js/components/checkout/payment-methods-section.tsx
import React from 'react';
import { Wallet, Upload, CheckCircle2, Info } from 'lucide-react';
import { PaymentMethod } from '@/types';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface PaymentMethodsSectionProps {
    paymentMethods: PaymentMethod[];
    selectedMethodId: string;
    onMethodSelect: (method: PaymentMethod) => void;
    paymentProof: File | null;
    onPaymentProofChange: (file: File | null) => void;
    errors: Record<string, string>;
}

export default function PaymentMethodsSection({
    paymentMethods,
    selectedMethodId,
    onMethodSelect,
    paymentProof,
    onPaymentProofChange,
    errors
}: PaymentMethodsSectionProps) {
    const { __ } = useTranslate();

    const getTranslation = (field: any) => {
        const locale = 'en'; // Simplifié pour l'exemple
        if (typeof field === 'object' && field !== null) {
            return field[locale] || field['en'] || Object.values(field)[0];
        }
        return field;
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">{__('Checkout')}</h1>
                <h2 className="text-2xl font-semibold text-foreground">{__('Payment Method')}</h2>
            </div>

            <div className="space-y-4">
                {paymentMethods.map((method) => (
                    <div key={method.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                        <label onClick={() => onMethodSelect(method)} className={cn(
                            "flex items-center justify-between p-6 cursor-pointer transition-all",
                            selectedMethodId === method.id.toString() ? "bg-primary/5 border-primary" : ""
                        )}>
                            <div className="flex items-center gap-4">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 overflow-hidden bg-muted",
                                        selectedMethodId === method.id.toString() ? "bg-primary/20 scale-110" : "",
                                    )}
                                >
                                    {method.logo && (
                                        <img
                                            src={method.logo.startsWith('http') ? method.logo : `/storage/${method.logo}`}
                                            alt={getTranslation(method.name)}
                                            className="w-full h-full object-contain p-2"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    )}
                                    <Wallet
                                        size={24}
                                        className={cn(
                                            "transition-all duration-200",
                                            method.logo ? "hidden" : "text-muted-foreground",
                                        )}
                                    />
                                </div>
                                <div>
                                    <span className="font-medium text-foreground">{getTranslation(method.name)}</span>
                                    <p className="text-sm text-muted-foreground">{__('Click to select this payment method')}</p>
                                </div>
                            </div>
                            <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                                selectedMethodId === method.id.toString() ? "border-primary bg-primary" : "border-input"
                            )}>
                                {selectedMethodId === method.id.toString() && (
                                    <div className="w-2 h-2 bg-primary-foreground rounded-full animate-in zoom-in duration-200"></div>
                                )}
                            </div>
                        </label>

                        {selectedMethodId === method.id.toString() && (
                            <div className="px-6 pb-6 border-t border-border animate-in slide-in-from-top-2 duration-300">
                                <div className="pt-4 space-y-4">
                                    <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                        <Info className="text-blue-600 dark:text-blue-400 shrink-0" size={20} />
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            {getTranslation(method.instructions)}
                                        </p>
                                    </div>

                                    {method.payment_details && (
                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-foreground mb-3">{__('Payment Details')}</h4>
                                            <div className="space-y-2">
                                                {Object.entries(method.payment_details).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                                        <span className="text-sm font-medium text-foreground capitalize">{key}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-sm text-foreground break-all">{value}</span>
                                                            <button
                                                                onClick={() => navigator.clipboard.writeText(value)}
                                                                className="text-xs text-primary hover:text-primary/80 transition-colors"
                                                                title={__('Copy to clipboard')}
                                                            >
                                                                {__('Copy')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground">{__('Upload Payment Proof')}</label>
                                        <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                onChange={(e) => onPaymentProofChange(e.target.files ? e.target.files[0] : null)}
                                                className="hidden"
                                                id="payment_proof"
                                            />
                                            <label htmlFor="payment_proof" className="cursor-pointer">
                                                {paymentProof ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <CheckCircle2 className="text-green-600" size={32} />
                                                        <span className="text-sm font-medium text-foreground">{paymentProof.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                onPaymentProofChange(null);
                                                            }}
                                                            className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                                                        >
                                                            {__('Remove')}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Upload className="text-muted-foreground" size={32} />
                                                        <span className="text-sm text-muted-foreground">{__('Click to upload or drag and drop')}</span>
                                                        <span className="text-xs text-muted-foreground">{__('PNG, JPG, PDF up to 10MB')}</span>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                        {errors.payment_proof && (
                                            <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors.payment_proof}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}