import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Package, 
    CheckCircle2, 
    Clock, 
    MapPin, 
    Calendar,
    ArrowLeft,
    Truck,
    CreditCard,
    User,
    Phone,
    Mail,
    FileText,
    Navigation,
    Flag,
    MapPinned
} from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import ShopLayout from '@/layouts/shop/shop-layout';
import dayjs from 'dayjs';

interface ShippingStep {
    id: number;
    position: number;
    location_name: string;
    status_description: string | null;
    is_reached: boolean;
    reached_at: string | null;
    estimated_arrival: string | null;
    latitude?: number;
    longitude?: number;
}

interface OrderItem {
    id: number;
    product_id: number | null;
    product_name: string;
    quantity: number;
    price: number;
    unit_at_purchase: string | null;
    subtotal: number;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    status_label: string;
    payment_status: string;
    payment_status_label: string;
    total_amount: number;
    shipping_address: {
        first_name?: string;
        last_name?: string;
        street?: string;
        city?: string;
        country?: string;
        phone?: string;
        email?: string;
    };
    notes: string | null;
    created_at: string;
    payment_verified_at: string | null;
    payment_method: {
        id: number;
        name: string;
        description: string | null;
    } | null;
    items: OrderItem[];
    shipping_steps: ShippingStep[];
}

interface Metrics {
    percentage: number;
    current_step: number;
    total_steps: number;
    is_delivered: boolean;
}

interface Props {
    order: Order;
    metrics: Metrics;
}

export default function OrderTrackingShow({ order, metrics }: Props) {
    const { __ } = useTranslate();
    const { props } = usePage();
    const locale = (props as { locale?: string })?.locale ?? 'en';

    const getStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            'waiting_payment': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            'processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            'shipping': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            'delivered': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    };

    const getPaymentStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            'waiting_verification': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            'paid': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            'failed': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            'refunded': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    };

    return (
        <ShopLayout>
            <Head title={`${__('Order Tracking')} - ${order.order_number}`} />

            <div className="min-h-screen bg-background px-4 pt-6 pb-24 md:pt-8 md:pb-10">
                <div className="w-full max-w-6xl mx-auto space-y-5 md:space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.get(`/${locale}/track-order`)}
                            className="gap-2 text-sm md:text-base"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {__('Search Another Order')}
                        </Button>
                    </div>

                    {/* Order Summary Card */}
                    <Card className="border-2 shadow-lg">
                        <CardHeader className="bg-primary/5">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2.5 md:p-3 bg-primary/10 rounded-2xl">
                                        <Package className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl md:text-2xl font-black">
                                            {__('Order')} #{order.order_number}
                                        </CardTitle>
                                        <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                            {__('Placed on')} {dayjs(order.created_at).format('DD MMMM YYYY [at] HH:mm')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start md:items-end gap-2">
                                    <Badge className={cn("text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2", getStatusColor(order.status))}>
                                        {order.status_label}
                                    </Badge>
                                    <Badge className={cn("text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2", getPaymentStatusColor(order.payment_status))}>
                                        {order.payment_status_label}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-muted-foreground">
                                        <CreditCard className="h-4 w-4" />
                                        {__('Total Amount')}
                                    </div>
                                    <p className="text-xl md:text-2xl font-black text-primary">
                                        ${order.total_amount.toLocaleString('en-US', { 
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-muted-foreground">
                                        <Truck className="h-4 w-4" />
                                        {__('Payment Method')}
                                    </div>
                                    <p className="text-sm md:text-lg font-semibold">
                                        {order.payment_method?.name || __('Not specified')}
                                    </p>
                                </div>
                                {order.payment_verified_at && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4" />
                                            {__('Payment Verified')}
                                        </div>
                                        <p className="text-xs md:text-sm">
                                            {dayjs(order.payment_verified_at).format('DD MMM YYYY')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main content grid: left = shipping, right = order details */}
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)] gap-5 md:gap-6">
                        <div className="space-y-5 md:space-y-6">
                            {/* Progress Metrics */}
                            {metrics.total_steps > 0 && (
                                <Card className="border">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                            <Flag className="h-5 w-5" />
                                            {__('Shipping Progress')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 md:space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs md:text-sm text-muted-foreground">{__('Progress')}</p>
                                                    <p className="text-2xl md:text-3xl font-black">{metrics.percentage}%</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs md:text-sm text-muted-foreground">{__('Steps Completed')}</p>
                                                    <p className="text-lg md:text-2xl font-bold">
                                                        {metrics.current_step} / {metrics.total_steps}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-2 md:h-3 w-full bg-secondary rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary transition-all duration-1000" 
                                                    style={{ width: `${metrics.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Shipping Timeline */}
                            {order.shipping_steps.length > 0 ? (
                                <Card className="border">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                            <MapPinned className="h-5 w-5" />
                                            {__('Shipping Timeline')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 md:p-6">
                                        <div className="space-y-4 md:space-y-6">
                                            {order.shipping_steps.map((step, index) => (
                                                <div key={step.id} className="relative pl-10 md:pl-12">
                                                    {index !== order.shipping_steps.length - 1 && (
                                                        <div className={cn(
                                                            "absolute left-[17px] md:left-[19px] top-9 md:top-10 bottom-[-20px] md:bottom-[-24px] w-[3px] md:w-1 rounded-full z-0",
                                                            step.is_reached ? "bg-primary" : "bg-secondary"
                                                        )} />
                                                    )}

                                                    <div className={cn(
                                                        "absolute left-0 top-1.5 md:top-2 size-9 md:size-10 rounded-full border-4 border-background flex items-center justify-center z-10 shadow-sm",
                                                        step.is_reached ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                                                    )}>
                                                        {step.is_reached ? (
                                                            <CheckCircle2 size={16} className="md:size-[18px]" />
                                                        ) : (
                                                            <span className="text-[11px] md:text-xs font-bold">{step.position}</span>
                                                        )}
                                                    </div>

                                                    <Card className={cn(
                                                        "border shadow-sm transition-all rounded-xl overflow-hidden",
                                                        step.is_reached ? "bg-primary/5 border-primary/20" : "bg-card"
                                                    )}>
                                                        <CardContent className="p-4 md:p-5">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                        <h4 className="font-bold text-sm md:text-base">
                                                                            {step.location_name}
                                                                        </h4>
                                                                        <Badge variant={step.is_reached ? "default" : "secondary"} className="text-[11px] md:text-xs">
                                                                            {step.is_reached ? __('Reached') : __('Pending')}
                                                                        </Badge>
                                                                        {step.reached_at && (
                                                                            <Badge variant="outline" className="text-[11px] md:text-xs">
                                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                                {dayjs(step.reached_at).format('DD MMM YYYY')}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {step.status_description && (
                                                                        <p className="text-xs md:text-sm text-muted-foreground mb-2">
                                                                            {step.status_description}
                                                                        </p>
                                                                    )}
                                                                    
                                                                    {(step.latitude || step.longitude) && (
                                                                        <div className="flex items-center gap-1 text-[11px] md:text-xs text-muted-foreground">
                                                                            <MapPin className="h-3 w-3" />
                                                                            {step.latitude?.toFixed(6)}, {step.longitude?.toFixed(6)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="border">
                                    <CardContent className="p-10 md:p-12 text-center">
                                        <Navigation className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
                                        <p className="text-sm md:text-base text-muted-foreground">
                                            {__('No shipping information available yet.')}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-5 md:space-y-6">
                            {/* Order Items */}
                            <Card className="border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <FileText className="h-5 w-5" />
                                        {__('Order Items')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 md:space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm md:text-base">{item.product_name}</p>
                                                    <p className="text-xs md:text-sm text-muted-foreground">
                                                        {__('Quantity')}: {item.quantity} {item.unit_at_purchase || ''}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-sm md:text-base">
                                                        ${(item.subtotal).toLocaleString('en-US', { 
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </p>
                                                    <p className="text-[11px] md:text-xs text-muted-foreground">
                                                        ${item.price.toLocaleString('en-US', { 
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })} {__('each')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between pt-3 md:pt-4 border-t font-bold text-base md:text-lg">
                                            <span>{__('Total')}</span>
                                            <span className="text-primary">
                                                ${order.total_amount.toLocaleString('en-US', { 
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shipping Address */}
                            {order.shipping_address && (
                                <Card className="border">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                            <MapPin className="h-5 w-5" />
                                            {__('Shipping Address')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {(order.shipping_address.first_name || order.shipping_address.last_name) && (
                                                <div className="flex items-center gap-2 text-sm md:text-base">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <p>
                                                        {order.shipping_address.first_name} {order.shipping_address.last_name}
                                                    </p>
                                                </div>
                                            )}
                                            {order.shipping_address.street && (
                                                <div className="flex items-center gap-2 text-sm md:text-base">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <p>{order.shipping_address.street}</p>
                                                </div>
                                            )}
                                            {order.shipping_address.city && (
                                                <p className="ml-6 text-sm md:text-base">{order.shipping_address.city}</p>
                                            )}
                                            {order.shipping_address.country && (
                                                <p className="ml-6 text-sm md:text-base">{order.shipping_address.country}</p>
                                            )}
                                            {order.shipping_address.phone && (
                                                <div className="flex items-center gap-2 text-sm md:text-base">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <p>{order.shipping_address.phone}</p>
                                                </div>
                                            )}
                                            {order.shipping_address.email && (
                                                <div className="flex items-center gap-2 text-sm md:text-base">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <p>{order.shipping_address.email}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Notes */}
                            {order.notes && (
                                <Card className="border">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                            <FileText className="h-5 w-5" />
                                            {__('Order Notes')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm md:text-base text-muted-foreground">{order.notes}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
