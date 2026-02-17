// resources/js/components/checkout/checkout-page.tsx
import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import orders from '@/routes/orders';
import ShopLayout from '@/layouts/shop/shop-layout';
import { FileText, Loader2 } from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import countries from 'world-countries';

// Import des composants
import CheckoutProgressBar from './checkout-progress-bar';
import ShippingAddressSection from './shipping-address-form';
import BillingAddressSection from './billing-address-section';
import PaymentMethodsSection from './payment-methods-section';
import OrderSummary from './order-summary';
import CheckoutSteps from './checkout-steps';

// Import des types
import { 
    CartData, 
    PaymentMethod, 
    CheckoutFormData, 
    ShippingMethod, 
    Country 
} from '@/types';

interface Props {
    cart: CartData;
    payment_methods: PaymentMethod[];
}

export default function CheckoutPage({ cart, payment_methods }: Props) {
    const { __ } = useTranslate();
    const { props } = usePage<any>();
    const locale = props.locale || 'en';
    const [step, setStep] = useState(1);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

    // Liste des pays triée par nom
    const countryList: Country[] = countries
        .map(c => ({ code: c.cca2, name: c.name.common }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const { data, setData, post, processing, errors } = useForm<CheckoutFormData>({
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
            street: '',
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
            street: '',
            apartment: '',
            company: '',
        },
        shipping_method: 'standard',
        notes: '',
        payment_proof: null,
    });

    const handleMethodSelect = (method: PaymentMethod) => {
        setData('payment_method_id', method.id.toString());
        setSelectedMethod(method);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(orders.store.url());
    };

    const canGoToPayment = !!(
        data.shipping_address.phone &&
        data.shipping_address.country &&
        data.shipping_address.city &&
        data.shipping_address.zip_code &&
        data.shipping_address.street
    );

    const shippingMethods: ShippingMethod[] = [
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
            <Head title={__('Checkout')} />

            <div className="min-h-screen bg-background">
                <CheckoutProgressBar currentStep={step} />

                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 lg:gap-8">
                        <CheckoutSteps
                            step={step}
                            setStep={setStep}
                            canGoToPayment={canGoToPayment}
                            paymentMethodSelected={!!data.payment_method_id}
                            processing={processing}
                        >
                            {/* STEP 1: SHIPPING */}
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <ShippingAddressSection
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    countries={countryList}
                                />
                                <BillingAddressSection
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    countries={countryList}
                                />
                            </div>

                            {/* STEP 2: PAYMENT */}
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <PaymentMethodsSection
                                    paymentMethods={payment_methods}
                                    selectedMethodId={data.payment_method_id}
                                    onMethodSelect={handleMethodSelect}
                                    paymentProof={data.payment_proof}
                                    onPaymentProofChange={(file) => setData('payment_proof', file)}
                                    errors={errors}
                                />
                            </div>

                            {/* STEP 3: REVIEW */}
                            <div className="space-y-6 animate-in fade-in duration-300">
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
                                                    {data.shipping_address.street}{data.shipping_address.apartment && `, ${data.shipping_address.apartment}`}
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
                                                        {data.billing_address.street}{data.billing_address.apartment && `, ${data.billing_address.apartment}`}
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
                                                                src={selectedMethod.logo.startsWith('http') ? selectedMethod.logo : `/storage/${selectedMethod.logo}`}
                                                                alt={
                                                                    typeof selectedMethod.name === 'string'
                                                                        ? selectedMethod.name
                                                                        : selectedMethod.name[locale]
                                                                }
                                                                className="w-full h-full object-contain p-1.5"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {selectedMethod && (typeof selectedMethod.name === 'string' ? selectedMethod.name : selectedMethod.name[locale])}
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
                        </CheckoutSteps>

                        <OrderSummary
                            cart={cart}
                            selectedShippingMethod={selectedShippingMethod}
                            paymentMethods={payment_methods}
                            taxAmount={taxAmount}
                            finalTotal={finalTotal}
                            step={step}
                            onPlaceOrder={handleSubmit}
                            processing={processing}
                        />
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}