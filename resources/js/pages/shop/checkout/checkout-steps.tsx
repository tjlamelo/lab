// resources/js/components/checkout/checkout-steps.tsx
import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface CheckoutStepsProps {
    step: number;
    setStep: (step: number) => void;
    canGoToPayment: boolean;
    paymentMethodSelected: boolean;
    processing: boolean;
    children: React.ReactNode;
}

export default function CheckoutSteps({
    step,
    setStep,
    canGoToPayment,
    paymentMethodSelected,
    processing,
    children
}: CheckoutStepsProps) {
    const { __ } = useTranslate();

    return (
        <div className="relative">
            <div className="pr-2 space-y-6 pb-24 lg:pb-6">
                {React.Children.map(children, (child, index) => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child as React.ReactElement<any>, {
                            style: { display: index + 1 === step ? 'block' : 'none' }
                        });
                    }
                    return child;
                })}

                {/* Navigation buttons */}
                <div className="flex justify-between items-center pt-6">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors group"
                        >
                            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                            {__('Back')}
                        </button>
                    )}
                    
                    {step < 3 && (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={(step === 1 && !canGoToPayment) || (step === 2 && !paymentMethodSelected)}
                            className="ml-auto bg-primary text-primary-foreground py-4 px-6 rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:scale-[1.02]"
                        >
                            {step === 1 ? __('Continue to Payment') : __('Review Order')} 
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}