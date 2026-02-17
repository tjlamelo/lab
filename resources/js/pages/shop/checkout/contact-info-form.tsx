// resources/js/components/checkout/contact-info-form.tsx
import React from 'react';
import { User, Phone } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import { AddressData } from '@/types';
import { useTranslate } from '@/lib/i18n';
import 'react-phone-number-input/style.css';

interface ContactInfoFormProps {
    data: AddressData;
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    title: string;
    prefix: string;
}

export default function ContactInfoForm({ data, setData, errors, title, prefix }: ContactInfoFormProps) {
    const { __ } = useTranslate();

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                <User size={20} className="text-primary" />
                {title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{__('First Name')} *</label>
                    <input
                        className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                        value={data.first_name}
                        onChange={e => setData(`${prefix}.first_name`, e.target.value)}
                    />
                    {errors[`${prefix}.first_name`] && (
                        <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors[`${prefix}.first_name`]}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{__('Last Name')} *</label>
                    <input
                        className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                        value={data.last_name}
                        onChange={e => setData(`${prefix}.last_name`, e.target.value)}
                    />
                    {errors[`${prefix}.last_name`] && (
                        <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors[`${prefix}.last_name`]}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{__('Email')} *</label>
                    <input
                        type="email"
                        className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                        value={data.email}
                        onChange={e => setData(`${prefix}.email`, e.target.value)}
                    />
                    {errors[`${prefix}.email`] && (
                        <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors[`${prefix}.email`]}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{__('Phone')} *</label>
                    <div className="relative">
                        <PhoneInput
                            international
                            value={data.phone}
                            onChange={(val) => setData(`${prefix}.phone`, val || '')}
                            className="flex h-12 px-4 rounded-lg border border-input bg-background focus-within:border-primary transition-all"
                        />
                    </div>
                    {errors[`${prefix}.phone`] && (
                        <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors[`${prefix}.phone`]}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{__('Company')} ({__('Optional')})</label>
                <input
                    className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                    value={data.company}
                    onChange={e => setData(`${prefix}.company`, e.target.value)}
                />
            </div>
        </div>
    );
}