import React, { useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Package, AlertCircle, Clock, CreditCard } from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import ShopLayout from '@/layouts/shop/shop-layout';

interface Props {
    error?: string;
    orderNumber?: string;
    myOrders?: Array<{
        id: number;
        order_number: string;
        status: string | null;
        status_label: string | null;
        payment_status: string | null;
        payment_status_label: string | null;
        total_amount: number;
        created_at: string;
    }>;
}

export default function OrderTrackingIndex({ error, orderNumber, myOrders }: Props) {
    const { __ } = useTranslate();
    const { props } = usePage();
    const locale = (props as { locale?: string })?.locale ?? 'en';
    const [searchValue, setSearchValue] = useState(orderNumber || '');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchValue.trim()) return;

        setIsSearching(true);
        router.post(`/${locale}/track-order/search`, {
            order_number: searchValue.trim()
        }, {
            onFinish: () => setIsSearching(false),
            onError: () => setIsSearching(false)
        });
    };

    const hasMyOrders = Array.isArray(myOrders) && myOrders.length > 0;

    const formatDate = (iso: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <ShopLayout>
            <Head title={__('Track Your Order')} />

            <div className="min-h-screen bg-background px-4 pt-8 pb-24 md:pt-12 md:pb-12">
                <div className="w-full max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8 md:mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full mb-4 md:mb-6">
                            <Package className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-3 md:mb-4">
                            {__('Track Your Order')}
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                            {__('Enter your order number to view the current status and shipping details of your order.')}
                        </p>
                    </div>

                    {/* Search Card */}
                    <Card className="border-2 shadow-lg">
                        <CardHeader className="pb-3 md:pb-4">
                            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                <Search className="h-5 w-5" />
                                {__('Order Lookup')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3 md:pt-4">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="order_number" className="text-sm md:text-base font-semibold">
                                        {__('Order Number')}
                                    </Label>
                                    <Input
                                        id="order_number"
                                        type="text"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
                                        placeholder={__('e.g., CMD-2026-ABC123')}
                                        className="text-base md:text-lg h-12 md:h-14"
                                        required
                                        autoFocus
                                    />
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        {__('You can find your order number in your confirmation email or invoice.')}
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 md:p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                                        <AlertCircle className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                                        <p className="text-xs md:text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-11 md:h-12 text-sm md:text-base font-semibold"
                                    disabled={isSearching || !searchValue.trim()}
                                >
                                    {isSearching ? (
                                        <>
                                            <Search className="h-5 w-5 mr-2 animate-pulse" />
                                            {__('Searching...')}
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-5 w-5 mr-2" />
                                            {__('Track Order')}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Logged-in user orders */}
                    {hasMyOrders && (
                        <div className="mt-8 space-y-3">
                            <h2 className="text-lg md:text-xl font-bold">
                                {__('Your recent orders')}
                            </h2>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                {__('Click on an order to directly open its tracking page.')}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {myOrders!.map((o) => (
                                    <Card 
                                        key={o.id} 
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => router.get(`/${locale}/track-order/${o.order_number}`)}
                                    >
                                        <CardContent className="p-3 md:p-4 flex flex-col gap-1.5 md:gap-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-primary" />
                                                    <span className="font-semibold text-xs md:text-sm">
                                                        {__('Order')} #{o.order_number}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] md:text-xs text-muted-foreground">
                                                    {formatDate(o.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-2 text-[11px] md:text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{o.status_label ?? o.status}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] md:text-xs text-muted-foreground">
                                                    <CreditCard className="h-3 w-3" />
                                                    <span>{o.payment_status_label ?? o.payment_status}</span>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-sm md:text-base font-semibold text-primary">
                                                ${o.total_amount.toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Help Section */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        <Card className="border">
                            <CardContent className="p-4 md:p-6 text-center">
                                <div className="text-2xl md:text-3xl mb-1 md:mb-2">📧</div>
                                <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">{__('Check Your Email')}</h3>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    {__('Your order number was sent to your email address after purchase.')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border">
                            <CardContent className="p-4 md:p-6 text-center">
                                <div className="text-2xl md:text-3xl mb-1 md:mb-2">📄</div>
                                <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">{__('Check Your Invoice')}</h3>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    {__('The order number is also displayed on your invoice.')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border">
                            <CardContent className="p-4 md:p-6 text-center">
                                <div className="text-2xl md:text-3xl mb-1 md:mb-2">❓</div>
                                <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">{__('Need Help?')}</h3>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    {__('Contact our support team if you cannot find your order number.')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
