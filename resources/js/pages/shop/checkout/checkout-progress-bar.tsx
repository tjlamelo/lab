// resources/js/components/checkout/checkout-progress-bar.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CheckoutProgressBarProps {
    currentStep: number;
}

export default function CheckoutProgressBar({ currentStep }: CheckoutProgressBarProps) {
    return (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="max-w-7xl mx-auto py-6 px-4">
                <div className="flex items-center justify-center">
                    <div className="flex items-center">
                        <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all duration-300",
                            currentStep >= 1 ? "bg-primary text-primary-foreground border-primary scale-110" : "bg-card text-muted-foreground border-border")}>
                            1
                        </div>
                        <div className="w-16 md:w-20 h-1 bg-border">
                            <div className={cn("h-full transition-all duration-500", currentStep >= 2 ? "bg-primary" : "")}></div>
                        </div>
                        <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all duration-300",
                            currentStep >= 2 ? "bg-primary text-primary-foreground border-primary scale-110" : "bg-card text-muted-foreground border-border")}>
                            2
                        </div>
                        <div className="w-16 md:w-20 h-1 bg-border">
                            <div className={cn("h-full transition-all duration-500", currentStep >= 3 ? "bg-primary" : "")}></div>
                        </div>
                        <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all duration-300",
                            currentStep >= 3 ? "bg-primary text-primary-foreground border-primary scale-110" : "bg-card text-muted-foreground border-border")}>
                            3
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}