// resources/js/components/checkout/billing-address-section.tsx
import React from 'react';
import { FileText, Info } from 'lucide-react';
import ContactInfoForm from './contact-info-form';
import AddressForm from './address-form';
import { AddressData, Country } from '@/types';
import { useTranslate } from '@/lib/i18n';

interface BillingAddressSectionProps {
    data: {
        billing_address: AddressData & { same_as_shipping: boolean };
    };
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    countries: Country[];
}

export default function BillingAddressSection({ data, setData, errors, countries }: BillingAddressSectionProps) {
    const { __ } = useTranslate();

    if (data.billing_address.same_as_shipping) {
        return null;
    }

    return (
        <div className="border-t border-border pt-6 space-y-4 animate-in fade-in duration-300">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                {__('Billing Address')}
            </h3>
            
            <div className="space-y-4">
                <ContactInfoForm
                    data={data.billing_address}
                    setData={setData}
                    errors={errors}
                    title={__('Contact Information')}
                    prefix="billing_address"
                />

                <div className="border-t border-border pt-6">
                    <AddressForm
                        data={data.billing_address}
                        setData={setData}
                        errors={errors}
                        title={__('Billing Address')}
                        prefix="billing_address"
                        countries={countries}
                    />
                </div>
            </div>

            <div className="bg-muted/30 border border-border rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                    <Info className="text-primary mt-0.5" size={18} />
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">{__('Billing Information')}</p>
                        <p>{__('Your billing information must match the details on your payment method to ensure successful processing.')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}