// resources/js/components/checkout/shipping-address-section.tsx
import React from 'react';
import ContactInfoForm from './contact-info-form';
import AddressForm from './address-form';
import { AddressData, CheckoutFormData, Country } from '@/types';
import { useTranslate } from '@/lib/i18n';
interface ShippingAddressSectionProps {
    // CORRECTION : Le type de `data` doit être `CheckoutFormData`
    data: CheckoutFormData;
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    countries: Country[];
}

export default function ShippingAddressSection({ data, setData, errors, countries }: ShippingAddressSectionProps) {
    const { __ } = useTranslate();

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">{__('Checkout')}</h1>
                <h2 className="text-2xl font-semibold text-foreground">{__('Shipping Information')}</h2>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6 transition-all duration-200 hover:shadow-md">
                <ContactInfoForm
                    data={data.shipping_address}
                    setData={setData}
                    errors={errors}
                    title={__('Contact Information')}
                    prefix="shipping_address"
                />

                <div className="border-t border-border pt-6">
                    <AddressForm
                        data={data.shipping_address}
                        setData={setData}
                        errors={errors}
                        title={__('Shipping Address')}
                        prefix="shipping_address"
                        countries={countries}
                    />
                </div>

                <div className="border-t border-border pt-6">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="billing_same"
                            checked={data.billing_address.same_as_shipping}
                            onChange={e => setData('billing_address.same_as_shipping', e.target.checked)}
                            className="mr-2 text-primary focus:ring-ring"
                        />
                        <label htmlFor="billing_same" className="text-sm font-medium text-foreground">
                            {__('Billing address is the same as shipping address')}
                        </label>
                    </div>
                </div>

                <div className="border-t border-border pt-6">
                    <label className="text-sm font-medium text-foreground">{__('Order Notes')} ({__('Optional')})</label>
                    <textarea
                        className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none mt-2"
                     value={data.notes || ''}
                onChange={e => setData('notes', e.target.value)}
                rows={4}
                placeholder={__('Notes about your order, e.g. special notes for delivery.')}
                    />
                </div>
            </div>
        </div>
    );
}