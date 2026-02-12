import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import orders from '@/routes/orders';
import ShopLayout from '@/layouts/shop/shop-layout';
import { cn } from '@/lib/utils';
import { CreditCard, Loader2, ChevronRight, ChevronLeft, CheckCircle2, Upload, Info, Globe, MapPin, Phone, User, FileText, Truck, Shield, Wallet } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import { useTranslate } from '@/lib/i18n';
import 'react-phone-number-input/style.css';
import countries from 'world-countries';

interface Props {
  cart: { items: any[]; total: number; count: number; };
  payment_methods: {
    id: number;
    name: string | Record<string, string>;
    instructions: string | Record<string, string> | null;
    payment_details: Record<string, string> | null;
    slug: string;
    logo: string | null;
  }[];
}

export default function Checkout({ cart, payment_methods }: Props) {
  const { __ } = useTranslate();
  const { props } = usePage<any>();
  const locale = props.locale || 'en';
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);

  // Liste des pays triée par nom
  const countryList = countries
    .map(c => ({ code: c.cca2, name: c.name.common }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const { data, setData, post, processing, errors } = useForm({
    payment_method_id: '',
    shipping_address: {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      country: '',
      state: '',
      city: '',
      zip_code: '',
      address: '',
      apartment: '',
      company: '',
    },
    billing_address: {
      same_as_shipping: true,
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      country: '',
      state: '',
      city: '',
      zip_code: '',
      address: '',
      apartment: '',
      company: '',
    },
    shipping_method: 'standard',
    notes: '',
    payment_proof: null as File | null,
  });

  const getTranslation = (field: any) => {
    if (typeof field === 'object' && field !== null) {
      return field[locale] || field['en'] || Object.values(field)[0];
    }
    return field;
  };

  const handleMethodSelect = (method: any) => {
    setData('payment_method_id', method.id.toString());
    setSelectedMethod(method);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(orders.store.url());
  };

  const canGoToPayment =
    data.shipping_address.phone &&
    data.shipping_address.country &&
    data.shipping_address.city &&
    data.shipping_address.zip_code &&
    data.shipping_address.address;

  const shippingMethods = [
    { id: 'standard', name: __('Standard Shipping'), price: 0, days: '5-7' },
    { id: 'express', name: __('Express Shipping'), price: 15, days: '2-3' },
    { id: 'overnight', name: __('Overnight Shipping'), price: 25, days: '1' }
  ];

  const selectedShippingMethod = shippingMethods.find(m => m.id === data.shipping_method) || shippingMethods[0];
  const totalWithShipping = cart.total + selectedShippingMethod.price;
  const taxAmount = cart.total * 0.08; // 8% tax
  const finalTotal = totalWithShipping + taxAmount;

  return (
    <ShopLayout>
      <Head title={__('Checkout')}>
        <style>{`
          /* Masquer la barre de défilement tout en gardant la fonctionnalité */
          .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;  /* Safari and Chrome */
          }
          
          /* Animation de défilement fluide */
          .smooth-scroll {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }
          
          /* Indicateur de défilement subtil */
          .scroll-indicator::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(to right, transparent, rgba(59, 130, 246, 0.5), transparent);
            animation: shimmer 2s infinite;
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          /* Correction pour la barre de navigation mobile */
          .checkout-container {
            padding-bottom: 88px; /* Espace pour la barre de navigation mobile */
          }
          
          @media (max-width: 1279px) {
            .checkout-container {
              padding-bottom: 140px; /* Plus d'espace sur mobile pour le résumé mobile */
            }
          
          /* Supprimer complètement l'indicateur de défilement */
          .no-scroll-indicator .scroll-indicator::after {
            display: none;
          }
        `}</style>
      </Head>

      <div className="min-h-screen bg-background no-scroll-indicator">
        {/* PROGRESS BAR */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all duration-300",
                  step >= 1 ? "bg-primary text-primary-foreground border-primary scale-110" : "bg-card text-muted-foreground border-border")}>
                  1
                </div>
                <div className="w-16 md:w-20 h-1 bg-border">
                  <div className={cn("h-full transition-all duration-500", step >= 2 ? "bg-primary" : "")}></div>
                </div>
                <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all duration-300",
                  step >= 2 ? "bg-primary text-primary-foreground border-primary scale-110" : "bg-card text-muted-foreground border-border")}>
                  2
                </div>
                <div className="w-16 md:w-20 h-1 bg-border">
                  <div className={cn("h-full transition-all duration-500", step >= 3 ? "bg-primary" : "")}></div>
                </div>
                <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all duration-300",
                  step >= 3 ? "bg-primary text-primary-foreground border-primary scale-110" : "bg-card text-muted-foreground border-border")}>
                  3
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 checkout-container">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 lg:gap-8">
            {/* LEFT SIDE - CONTENT SCROLLABLE SANS BARRE */}
            <div className="relative">
              <div className="hide-scrollbar smooth-scroll overflow-y-auto" style={{ height: 'calc(100vh - 140px)' }}>
                <div className="pr-2 space-y-6">
                  {/* STEP 1: SHIPPING */}
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">{__('Checkout')}</h1>
                        <h2 className="text-2xl font-semibold text-foreground">{__('Shipping Information')}</h2>
                      </div>

                      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6 transition-all duration-200 hover:shadow-md">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                            <User size={20} className="text-primary" />
                            {__('Contact Information')}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">{__('First Name')} *</label>
                              <input
                                className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                value={data.shipping_address.first_name}
                                onChange={e => setData('shipping_address', { ...data.shipping_address, first_name: e.target.value })}
                              />
                              {errors['shipping_address.first_name'] && (
                                <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['shipping_address.first_name']}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">{__('Last Name')} *</label>
                              <input
                                className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                value={data.shipping_address.last_name}
                                onChange={e => setData('shipping_address', { ...data.shipping_address, last_name: e.target.value })}
                              />
                              {errors['shipping_address.last_name'] && (
                                <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['shipping_address.last_name']}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">{__('Email')} *</label>
                              <input
                                type="email"
                                className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                value={data.shipping_address.email}
                                onChange={e => setData('shipping_address', { ...data.shipping_address, email: e.target.value })}
                              />
                              {errors['shipping_address.email'] && (
                                <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['shipping_address.email']}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">{__('Phone')} *</label>
                              <div className="relative">
                                <PhoneInput
                                  international
                                  value={data.shipping_address.phone}
                                  onChange={(val) => setData('shipping_address', { ...data.shipping_address, phone: val || '' })}
                                  className="flex h-12 px-4 rounded-lg border border-input bg-background focus-within:border-primary transition-all"
                                />
                              </div>
                              {errors['shipping_address.phone'] && (
                                <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['shipping_address.phone']}</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{__('Company')} ({__('Optional')})</label>
                            <input
                              className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                              value={data.shipping_address.company}
                              onChange={e => setData('shipping_address', { ...data.shipping_address, company: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="border-t border-border pt-6 space-y-4">
                          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                            <MapPin size={20} className="text-primary" />
                            {__('Shipping Address')}
                          </h3>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{__('Country')} *</label>
                            <select
                              className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none appearance-none"
                              value={data.shipping_address.country}
                              onChange={e => setData('shipping_address', { ...data.shipping_address, country: e.target.value })}
                            >
                              <option value="">{__('Select Country')}</option>
                              {countryList.map(c => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                              ))}
                            </select>
                            {errors['shipping_address.country'] && (
                              <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['shipping_address.country']}</p>
                              )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">{__('State/Province')} *</label>
                              <input
                                className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                value={data.shipping_address.state}
                                onChange={e => setData('shipping_address', { ...data.shipping_address, state: e.target.value })}
                              />
                              {errors['shipping_address.state'] && (
                                <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['shipping_address.state']}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">{__('City')} *</label>
                              <input
                                className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                value={data.shipping_address.city}
                                onChange={e => setData('shipping_address', { ...data.shipping_address, city: e.target.value })}
                              />
                              {errors['shipping_address.city'] && (
                                <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['shipping_address.city']}</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{__('Address')} *</label>
                            <input
                              className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                              value={data.shipping_address.address}
                              onChange={e => setData('shipping_address', { ...data.shipping_address, address: e.target.value })}
                              placeholder={__('Street address, P.O. box, company name, c/o')}
                            />
                            {errors['shipping_address.address'] && (
                              <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['shipping_address.address']}</p>
                              )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">{__('Apartment, suite, unit, etc.')} ({__('Optional')})</label>
                              <input
                                className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                value={data.shipping_address.apartment}
                                onChange={e => setData('shipping_address', { ...data.shipping_address, apartment: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">{__('ZIP/Postal Code')} *</label>
                              <input
                                className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                value={data.shipping_address.zip_code}
                                onChange={e => setData('shipping_address', { ...data.shipping_address, zip_code: e.target.value })}
                              />
                              {errors['shipping_address.zip_code'] && (
                                <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['shipping_address.zip_code']}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-border pt-6">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="billing_same"
                              checked={data.billing_address.same_as_shipping}
                              onChange={e => setData('billing_address', { ...data.billing_address, same_as_shipping: e.target.checked })}
                              className="mr-2 text-primary focus:ring-ring"
                            />
                            <label htmlFor="billing_same" className="text-sm font-medium text-foreground">
                              {__('Billing address is the same as shipping address')}
                            </label>
                          </div>
                        </div>

                        {!data.billing_address.same_as_shipping && (
                          <div className="border-t border-border pt-6 space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                              <FileText size={20} className="text-primary" />
                              {__('Billing Address')}
                            </h3>
                            
                            <div className="space-y-4">
                              <h4 className="text-md font-medium text-foreground flex items-center gap-2">
                                <User size={18} className="text-primary" />
                                {__('Contact Information')}
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground">{__('First Name')} *</label>
                                  <input
                                    className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                    value={data.billing_address.first_name}
                                    onChange={e => setData('billing_address', { ...data.billing_address, first_name: e.target.value })}
                                  />
                                  {errors['billing_address.first_name'] && (
                                    <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['billing_address.first_name']}</p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground">{__('Last Name')} *</label>
                                  <input
                                    className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                    value={data.billing_address.last_name}
                                    onChange={e => setData('billing_address', { ...data.billing_address, last_name: e.target.value })}
                                  />
                                  {errors['billing_address.last_name'] && (
                                    <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['billing_address.last_name']}</p>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground">{__('Email')} *</label>
                                  <input
                                    type="email"
                                    className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                    value={data.billing_address.email}
                                    onChange={e => setData('billing_address', { ...data.billing_address, email: e.target.value })}
                                  />
                                  {errors['billing_address.email'] && (
                                    <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['billing_address.email']}</p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground">{__('Phone')} *</label>
                                  <div className="relative">
                                    <PhoneInput
                                      international
                                      value={data.billing_address.phone}
                                      onChange={(val) => setData('billing_address', { ...data.billing_address, phone: val || '' })}
                                      className="flex h-12 px-4 rounded-lg border border-input bg-background focus-within:border-primary transition-all"
                                    />
                                  </div>
                                  {errors['billing_address.phone'] && (
                                    <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['billing_address.phone']}</p>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{__('Company')} ({__('Optional')})</label>
                                <input
                                  className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                  value={data.billing_address.company}
                                  onChange={e => setData('billing_address', { ...data.billing_address, company: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="border-t border-border pt-6 space-y-4">
                              <h4 className="text-md font-medium text-foreground flex items-center gap-2">
                                <MapPin size={18} className="text-primary" />
                                {__('Billing Address')}
                              </h4>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{__('Country')} *</label>
                                <select
                                  className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none appearance-none"
                                  value={data.billing_address.country}
                                  onChange={e => setData('billing_address', { ...data.billing_address, country: e.target.value })}
                                >
                                  <option value="">{__('Select Country')}</option>
                                  {countryList.map(c => (
                                    <option key={c.code} value={c.code}>{c.name}</option>
                                  ))}
                                </select>
                                {errors['billing_address.country'] && (
                                  <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['billing_address.country']}</p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground">{__('State/Province')} *</label>
                                  <input
                                    className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                    value={data.billing_address.state}
                                    onChange={e => setData('billing_address', { ...data.billing_address, state: e.target.value })}
                                  />
                                  {errors['billing_address.state'] && (
                                    <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['billing_address.state']}</p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground">{__('City')} *</label>
                                  <input
                                    className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                    value={data.billing_address.city}
                                    onChange={e => setData('billing_address', { ...data.billing_address, city: e.target.value })}
                                  />
                                  {errors['billing_address.city'] && (
                                    <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['billing_address.city']}</p>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{__('Address')} *</label>
                                <input
                                  className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                  value={data.billing_address.address}
                                  onChange={e => setData('billing_address', { ...data.billing_address, address: e.target.value })}
                                  placeholder={__('Street address, P.O. box, company name, c/o')}
                                />
                                {errors['billing_address.address'] && (
                                  <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['billing_address.address']}</p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground">{__('Apartment, suite, unit, etc.')} ({__('Optional')})</label>
                                  <input
                                    className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                    value={data.billing_address.apartment}
                                    onChange={e => setData('billing_address', { ...data.billing_address, apartment: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground">{__('ZIP/Postal Code')} *</label>
                                  <input
                                    className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none"
                                    value={data.billing_address.zip_code}
                                    onChange={e => setData('billing_address', { ...data.billing_address, zip_code: e.target.value })}
                                  />
                                  {errors['billing_address.zip_code'] && (
                                    <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors['billing_address.zip_code']}</p>
                                  )}
                                </div>
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
                        )}

                        <div className="border-t border-border pt-6">
                          <label className="text-sm font-medium text-foreground">{__('Order Notes')} ({__('Optional')})</label>
                          <textarea
                            className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all outline-none mt-2"
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            rows={4}
                            placeholder={__('Notes about your order, e.g. special notes for delivery.')}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => setStep(2)}
                        disabled={!canGoToPayment}
                        className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:scale-[1.02]"
                      >
                        {__('Continue to Payment')} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}

                  {/* STEP 2: PAYMENT */}
                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <button onClick={() => setStep(1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors group">
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> {__('Back to Shipping')}
                      </button>

                      <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">{__('Checkout')}</h1>
                        <h2 className="text-2xl font-semibold text-foreground">{__('Payment Method')}</h2>
                      </div>

                      <div className="space-y-4">
                        {payment_methods.map((method) => (
                          <div key={method.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                            <label onClick={() => handleMethodSelect(method)} className={cn(
                              "flex items-center justify-between p-6 cursor-pointer transition-all",
                              data.payment_method_id === method.id.toString() ? "bg-primary/5 border-primary" : ""
                            )}>
                              <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 overflow-hidden bg-muted",
                                  data.payment_method_id === method.id.toString() ? "bg-primary/20 scale-110" : ""
                                )}>
                                  {method.logo ? (
                                    <img 
                                      src={`/storage/${method.logo}`} 
                                      alt={getTranslation(method.name)}
                                      className="w-full h-full object-contain p-2"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <Wallet size={24} className={cn("transition-all duration-200", method.logo ? "hidden" : "text-muted-foreground")} />
                                </div>
                                <div>
                                  <span className="font-medium text-foreground">{getTranslation(method.name)}</span>
                                  <p className="text-sm text-muted-foreground">{__('Click to select this payment method')}</p>
                                </div>
                              </div>
                              <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                                data.payment_method_id === method.id.toString() ? "border-primary bg-primary" : "border-input"
                              )}>
                                {data.payment_method_id === method.id.toString() && (
                                  <div className="w-2 h-2 bg-primary-foreground rounded-full animate-in zoom-in duration-200"></div>
                                )}
                              </div>
                            </label>

                            {data.payment_method_id === method.id.toString() && (
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
                                        onChange={(e) => setData('payment_proof', e.target.files ? e.target.files[0] : null)}
                                        className="hidden"
                                        id="payment_proof"
                                      />
                                      <label htmlFor="payment_proof" className="cursor-pointer">
                                        {data.payment_proof ? (
                                          <div className="flex flex-col items-center gap-2">
                                            <CheckCircle2 className="text-green-600" size={32} />
                                            <span className="text-sm font-medium text-foreground">{data.payment_proof.name}</span>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                setData('payment_proof', null);
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

                      <button
                        onClick={() => setStep(3)}
                        disabled={!data.payment_method_id}
                        className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:scale-[1.02]"
                      >
                        {__('Review Order')} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}

                  {/* STEP 3: REVIEW */}
                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <button onClick={() => setStep(2)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors group">
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> {__('Back to Payment')}
                      </button>

                      <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">{__('Checkout')}</h1>
                        <h2 className="text-2xl font-semibold text-foreground">{__('Review Order')}</h2>
                      </div>

                      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium text-foreground mb-3">{__('Shipping Information')}</h3>
                            <div className="bg-muted/50 rounded-lg p-4">
                              <p className="font-medium text-foreground">{data.shipping_address.first_name} {data.shipping_address.last_name}</p>
                              <p className="text-sm text-muted-foreground">{data.shipping_address.email}</p>
                              <p className="text-sm text-muted-foreground">{data.shipping_address.phone}</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                {data.shipping_address.address}{data.shipping_address.apartment && `, ${data.shipping_address.apartment}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {data.shipping_address.city}, {data.shipping_address.state} {data.shipping_address.zip_code}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {countryList.find(c => c.code === data.shipping_address.country)?.name}
                              </p>
                            </div>
                          </div>

                          {!data.billing_address.same_as_shipping && (
                            <div>
                              <h3 className="text-lg font-medium text-foreground mb-3">{__('Billing Information')}</h3>
                              <div className="bg-muted/50 rounded-lg p-4">
                                <p className="font-medium text-foreground">{data.billing_address.first_name} {data.billing_address.last_name}</p>
                                <p className="text-sm text-muted-foreground">{data.billing_address.email}</p>
                                <p className="text-sm text-muted-foreground">{data.billing_address.phone}</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                  {data.billing_address.address}{data.billing_address.apartment && `, ${data.billing_address.apartment}`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {data.billing_address.city}, {data.billing_address.state} {data.billing_address.zip_code}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {countryList.find(c => c.code === data.billing_address.country)?.name}
                                </p>
                              </div>
                            </div>
                          )}

                          <div>
                            <h3 className="text-lg font-medium text-foreground mb-3">{__('Payment Method')}</h3>
                            <div className="bg-muted/50 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                {selectedMethod?.logo && (
                                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={`/storage/${selectedMethod.logo}`} 
                                      alt={getTranslation(selectedMethod.name)}
                                      className="w-full h-full object-contain p-1.5"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                    <Wallet size={20} className="hidden text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-foreground">
                                    {selectedMethod && getTranslation(selectedMethod.name)}
                                  </p>
                                  {data.payment_proof && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <FileText size={14} className="text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">{__('Payment proof uploaded')}: {data.payment_proof.name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-medium text-foreground mb-3">{__('Order Items')}</h3>
                            <div className="divide-y divide-border">
                              {cart.items.map((item, index) => (
                                <div key={index} className="py-4 flex justify-between">
                                  <div>
                                    <p className="font-medium text-foreground">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{__('Quantity')}: {item.quantity}</p>
                                  </div>
                                  <p className="font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleSubmit(e)}
                        disabled={processing}
                        className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:scale-[1.02]"
                      >
                        {processing ? <Loader2 className="animate-spin" size={18} /> : __('Place Order')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - FIXED ORDER SUMMARY */}
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
                  {payment_methods.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <h4 className="text-sm font-medium text-foreground mb-3">{__('We Accept')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {payment_methods.slice(0, 6).map((method) => (
                          <div 
                            key={method.id}
                            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden"
                            title={getTranslation(method.name)}
                          >
                            {method.logo ? (
                              <img 
                                src={`/storage/${method.logo}`} 
                                alt={getTranslation(method.name)}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <Wallet size={14} className={cn("transition-all duration-200", method.logo ? "hidden" : "text-muted-foreground")} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <button
                      onClick={(e) => handleSubmit(e)}
                      disabled={processing}
                      className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:scale-[1.02]"
                    >
                      {processing ? <Loader2 className="animate-spin" size={18} /> : __('Place Order')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Order Summary - Positionné au-dessus de la barre de navigation mobile */}
        <div className="xl:hidden fixed bottom-[72px] left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-[55]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{__('Total')}</p>
                <p className="text-xl font-bold text-primary">${finalTotal.toFixed(2)}</p>
              </div>
              <button
                onClick={() => {
                  if (step === 3) {
                    handleSubmit(new Event('submit') as any);
                  } else if (step === 2) {
                    setStep(3);
                  } else {
                    setStep(2);
                  }
                }}
                disabled={processing || (step === 1 && !canGoToPayment) || (step === 2 && !data.payment_method_id)}
                className="bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? <Loader2 className="animate-spin" size={18} /> : 
                 step === 1 ? __('Continue') : 
                 step === 2 ? __('Review') : 
                 __('Place Order')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}