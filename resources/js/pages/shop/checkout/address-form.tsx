// resources/js/components/checkout/address-form.tsx
import React from 'react';
import { MapPin } from 'lucide-react';
import { AddressData, Country } from '@/types';
import { useTranslate } from '@/lib/i18n';

interface AddressFormProps {
    data: AddressData;
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    title: string;
    prefix: string;
    countries: Country[];
}

export default function AddressForm({ data, setData, errors, title, prefix, countries }: AddressFormProps) {
    const { __ } = useTranslate();

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                {title}
            </h3>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{__('Country')} *</label>
                <select
                    className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none appearance-none"
                    value={data.country}
                    onChange={e => setData(`${prefix}.country`, e.target.value)}
                >
                    <option value="">{__('Select Country')}</option>
                    {countries.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                </select>
                {errors[`${prefix}.country`] && (
                    <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors[`${prefix}.country`]}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{__('State/Province')} *</label>
                    <input
                        className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                        value={data.state}
                        onChange={e => setData(`${prefix}.state`, e.target.value)}
                    />
                    {errors[`${prefix}.state`] && (
                        <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors[`${prefix}.state`]}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{__('City')} *</label>
                    <input
                        className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                        value={data.city}
                        onChange={e => setData(`${prefix}.city`, e.target.value)}
                    />
                    {errors[`${prefix}.city`] && (
                        <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors[`${prefix}.city`]}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{__('Address')} *</label>
                <input
                    className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                    value={data.street}
                    onChange={e => setData(`${prefix}.street`, e.target.value)}
                    placeholder={__('Street address, P.O. box, company name, c/o')}
                />
                {errors[`${prefix}.street`] && (
                    <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors[`${prefix}.street`]}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{__('Apartment, suite, unit, etc.')} ({__('Optional')})</label>
                    <input
                        className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                        value={data.apartment}
                        onChange={e => setData(`${prefix}.apartment`, e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{__('ZIP/Postal Code')} *</label>
                    <input
                        className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                        value={data.zip_code}
                        onChange={e => setData(`${prefix}.zip_code`, e.target.value)}
                    />
                    {errors[`${prefix}.zip_code`] && (
                        <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors[`${prefix}.zip_code`]}</p>
                    )}
                </div>
            </div>
        </div>
    );
}