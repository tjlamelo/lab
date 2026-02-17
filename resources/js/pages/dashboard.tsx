import React, { useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslate } from '@/lib/i18n';
import { TrendingUp, TrendingDown, PackageCheck, DollarSign, Users, Truck, CreditCard, Calendar } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    
];

type Period = 'day' | 'week' | 'month' | 'year';

type Props = {
    period: Period;
    kpis: {
        revenue_paid: number;
        orders: number;
        paid_orders: number;
        delivered_orders: number;
        pending_payment_orders: number;
        new_customers: number;
        avg_order_value: number;
    };
    deltas: {
        revenue_paid: number | null;
        orders: number | null;
        paid_orders: number | null;
    };
    series: Array<{
        label: string;
        revenue: number;
        orders: number;
        paid_orders: number;
    }>;
    top_products: Array<{
        product_id: number | null;
        name: string;
        qty: number;
        revenue: number;
    }>;
    recent_orders: Array<{
        id: number;
        order_number: string;
        total_amount: number;
        status: string;
        status_label: string;
        payment_status: string;
        payment_status_label: string;
        created_at: string | null;
    }>;
};

function formatUsd(value: number): string {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DeltaBadge({ value }: { value: number | null }) {
    const { __ } = useTranslate();
    if (value === null) {
        return <Badge variant="outline">{__('n/a')}</Badge>;
    }
    const positive = value >= 0;
    return (
        <Badge
            variant="outline"
            className={cn(
                'gap-1',
                positive ? 'text-green-700 border-green-200 bg-green-50' : 'text-red-700 border-red-200 bg-red-50',
            )}
        >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {value.toFixed(1)}%
        </Badge>
    );
}

function MiniChart({
    series,
    height = 180,
}: {
    series: Array<{ label: string; revenue: number; orders: number }>;
    height?: number;
}) {
    const padding = 28;
    const width = 900;
    const n = Math.max(series.length, 2);

    const maxRevenue = Math.max(...series.map((p) => p.revenue), 1);
    const maxOrders = Math.max(...series.map((p) => p.orders), 1);

    const pointsRevenue = series
        .map((p, i) => {
            const x = padding + (i * (width - padding * 2)) / (n - 1);
            const y = padding + (1 - p.revenue / maxRevenue) * (height - padding * 2);
            return `${x},${y}`;
        })
        .join(' ');

    const pointsOrders = series
        .map((p, i) => {
            const x = padding + (i * (width - padding * 2)) / (n - 1);
            const y = padding + (1 - p.orders / maxOrders) * (height - padding * 2);
            return `${x},${y}`;
        })
        .join(' ');

    const last = series[series.length - 1];
    const first = series[0];

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[900px] w-full">
                <rect x="0" y="0" width={width} height={height} rx="12" fill="transparent" />
                {/* grid */}
                {[0.25, 0.5, 0.75].map((t) => {
                    const y = padding + t * (height - padding * 2);
                    return <line key={t} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#E5E7EB" />;
                })}

                {/* revenue line */}
                <polyline points={pointsRevenue} fill="none" stroke="#7C3AED" strokeWidth="3" strokeLinejoin="round" />
                {/* orders line */}
                <polyline points={pointsOrders} fill="none" stroke="#111827" strokeOpacity="0.35" strokeWidth="2" strokeLinejoin="round" />

                {/* axes labels */}
                <text x={padding} y={height - 10} fontSize="12" fill="#6B7280">
                    {first?.label ?? ''}
                </text>
                <text x={width - padding} y={height - 10} textAnchor="end" fontSize="12" fill="#6B7280">
                    {last?.label ?? ''}
                </text>
            </svg>
        </div>
    );
}

export default function Dashboard({ period, kpis, deltas, series, top_products, recent_orders }: Props) {
    const { __ } = useTranslate();
    const periods: Array<{ key: Period; label: string }> = useMemo(
        () => [
            { key: 'day', label: __('Day') },
            { key: 'week', label: __('Week') },
            { key: 'month', label: __('Month') },
            { key: 'year', label: __('Year') },
        ],
        [__],
    );

    const chartSeries = useMemo(() => series.map((p) => ({ label: p.label, revenue: p.revenue, orders: p.orders })), [series]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('Dashboard')} />

            <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">{__('System Dashboard')}</h1>
                        <p className="text-muted-foreground mt-1">
                            {__('Key sales & operations statistics')}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {periods.map((p) => (
                            <Button
                                key={p.key}
                                variant={p.key === period ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                    router.get(dashboard.url({ query: { period: p.key } }), {}, { preserveScroll: true, preserveState: true })
                                }
                            >
                                {p.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-primary" />
                                    {__('Revenue (Paid)')}
                                </span>
                                <DeltaBadge value={deltas.revenue_paid} />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{formatUsd(kpis.revenue_paid)}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {__('Avg order')}: {formatUsd(kpis.avg_order_value)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <PackageCheck className="h-4 w-4 text-primary" />
                                    {__('Orders')}
                                </span>
                                <DeltaBadge value={deltas.orders} />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{kpis.orders.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {__('Paid')}: {kpis.paid_orders.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Truck className="h-4 w-4 text-primary" />
                                {__('Delivered')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{kpis.delivered_orders.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {__('Pending payment')}: {kpis.pending_payment_orders.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                {__('New customers')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{kpis.new_customers.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {__('In selected period')}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {__('Revenue & Orders trend')}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-2 mr-4">
                                <span className="inline-block h-2 w-6 rounded-full bg-purple-600" />
                                {__('Revenue (paid)')}
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <span className="inline-block h-2 w-6 rounded-full bg-black/30" />
                                {__('Orders')}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <MiniChart series={chartSeries} />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top products */}
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                {__('Top products (paid orders)')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {top_products.length === 0 ? (
                                <div className="text-sm text-muted-foreground">{__('No data for selected period')}</div>
                            ) : (
                                top_products.map((p) => (
                                    <div key={`${p.product_id ?? 'null'}-${p.name}`} className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="font-semibold truncate">{p.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {__('Qty')}: {p.qty.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="font-bold">{formatUsd(p.revenue)}</div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent orders */}
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle>{__('Recent orders')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recent_orders.length === 0 ? (
                                <div className="text-sm text-muted-foreground">{__('No orders in selected period')}</div>
                            ) : (
                                recent_orders.map((o) => (
                                    <div key={o.id} className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="font-semibold truncate">{o.order_number}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {o.status_label} • {o.payment_status_label}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">{formatUsd(o.total_amount)}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {o.created_at ? new Date(o.created_at).toLocaleString() : ''}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
