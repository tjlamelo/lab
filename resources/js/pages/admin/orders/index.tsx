import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useTranslate } from '@/lib/i18n';
import adminOrders from '@/routes/admin/orders';
import {
    Search,
    Eye,
    Package,
    CheckCircle2,
    Clock,
    Filter,
    Download,
    RefreshCw,
    MapPinned,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import dayjs from 'dayjs';
import tracking from '@/routes/admin/orders/tracking';
interface StatusOption {
    value: string;
    label: string;
}

interface Props {
    orders: {
        data: any[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        payment_status?: string;
    };
    config: {
        statuses: StatusOption[];
        payment_statuses: StatusOption[];
    };
}

export default function Index({ orders, filters, config }: Props) {
    const { __ } = useTranslate();
    const [search, setSearch] = useState(filters.search || '');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Application des filtres via l'URL (Inertia)
    const applyFilters = (newFilters: any) => {
        const query = { ...filters, ...newFilters };
        // Nettoyage des clés vides
        Object.keys(query).forEach((key) => !query[key] && delete query[key]);

        router.get(
            adminOrders.index.url({ query }),
            {},
            {
                preserveState: true,
                replace: true,
                onStart: () => setIsRefreshing(true),
                onFinish: () => setIsRefreshing(false),
            },
        );
    };

    // Générateur de badge logistique (Status)
    const getStatusBadge = (statusValue: string) => {
        const statusObj = config.statuses.find((s) => s.value === statusValue);
        const label = statusObj ? statusObj.label : statusValue;

        const styles: Record<string, string> = {
            waiting_payment: 'bg-amber-50 text-amber-700 border-amber-200',
            processing: 'bg-blue-50 text-blue-700 border-blue-200',
            shipping: 'bg-purple-50 text-purple-700 border-purple-200',
            delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            cancelled: 'bg-red-50 text-red-700 border-red-200',
        };

        return (
            <span
                className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold',
                    styles[statusValue] || 'bg-gray-50 text-gray-600',
                )}
            >
                {label}
            </span>
        );
    };

    // Récupération sécurisée du label de paiement
    const getPaymentLabel = (statusValue: string) => {
        const found = config.payment_statuses.find(
            (ps) => ps.value === statusValue,
        );
        return found ? found.label : statusValue;
    };

    // Export des données (simulé)
    const exportData = () => {
        // Logique d'exportation à implémenter
        console.log('Exportation des données...');
    };

    return (
        <AppLayout>
            <Head title={`${__('Orders Management')} - Admin`} />

            <div className="mx-auto max-w-7xl space-y-6 p-6">
                {/* --- HEADER --- */}
                <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {__('Orders Management')}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {__('Monitor and manage all orders in real-time')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => applyFilters({})}
                            className={cn(
                                'flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50',
                                isRefreshing && 'opacity-50',
                            )}
                            disabled={isRefreshing}
                        >
                            <RefreshCw
                                size={16}
                                className={cn(isRefreshing && 'animate-spin')}
                            />
                            {__('Refresh')}
                        </button>

                        <button
                            onClick={exportData}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                        >
                            <Download size={16} />
                            {__('Export')}
                        </button>

                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                            <span className="block text-xs font-medium text-gray-500">
                                {__('Total')}
                            </span>
                            <span className="text-xl font-bold text-gray-900">
                                {orders.total}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- STATS CARDS --- */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {config.statuses.slice(0, 4).map((status) => {
                        const count = orders.data.filter(
                            (order) => order.status === status.value,
                        ).length;
                        const styles: Record<string, string> = {
                            waiting_payment:
                                'bg-amber-50 border-amber-200 text-amber-700',
                            processing:
                                'bg-blue-50 border-blue-200 text-blue-700',
                            shipping:
                                'bg-purple-50 border-purple-200 text-purple-700',
                            delivered:
                                'bg-emerald-50 border-emerald-200 text-emerald-700',
                        };

                        return (
                            <div
                                key={status.value}
                                className={cn(
                                    'rounded-lg border p-4',
                                    styles[status.value] ||
                                        'border-gray-200 bg-gray-50 text-gray-700',
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        {status.label}
                                    </span>
                                    <span className="text-2xl font-bold">
                                        {count}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- FILTERS BAR --- */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="relative md:col-span-2">
                            <Search
                                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder={__(
                                    'Search by order # or email...',
                                )}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' &&
                                    applyFilters({ search })
                                }
                            />
                        </div>

                        <select
                            className="rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={filters.status || ''}
                            onChange={(e) =>
                                applyFilters({ status: e.target.value })
                            }
                        >
                            <option value="">{__('All Statuses')}</option>
                            {config.statuses.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className="rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={filters.payment_status || ''}
                            onChange={(e) =>
                                applyFilters({ payment_status: e.target.value })
                            }
                        >
                            <option value="">{__('Payment Status')}</option>
                            {config.payment_statuses.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* --- TABLE --- */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        {__('Order')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        {__('Customer')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        {__('Amount')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        {__('Status')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        {__('Payment')}
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        {__('Actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {orders.data.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="transition-colors hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.order_number}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {dayjs(order.created_at).format(
                                                    'DD MMM YYYY',
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.user?.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.user?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                ${Number(
                                                    order.total_amount,
                                                ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div
                                                className={cn(
                                                    'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                                                    order.payment_status ===
                                                        'paid'
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-amber-50 text-amber-700',
                                                )}
                                            >
                                                {order.payment_status ===
                                                'paid' ? (
                                                    <CheckCircle2 size={14} />
                                                ) : (
                                                    <Clock size={14} />
                                                )}
                                                {getPaymentLabel(
                                                    order.payment_status,
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        tracking.index(order.id)
                                                            .url,
                                                    )
                                                }
                                                className="rounded-xl p-2 text-gray-400 transition-all hover:bg-amber-50 hover:text-amber-600"
                                                title={__('Manage Tracking')}
                                            >
                                                <MapPinned size={18} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        adminOrders.show.url(
                                                            order.id,
                                                        ),
                                                    )
                                                }
                                                className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary"
                                                title={__('View details')}
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {orders.data.length === 0 && (
                        <div className="p-12 text-center">
                            <Package
                                size={48}
                                className="mx-auto mb-4 text-gray-300"
                            />
                            <p className="mb-1 text-lg font-medium text-gray-900">
                                {__('No orders found')}
                            </p>
                            <p className="text-sm text-gray-500">
                                {__('Try adjusting your filters')}
                            </p>
                        </div>
                    )}
                </div>

                {/* --- PAGINATION --- */}
                {orders.links.length > 3 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {orders.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url || link.active}
                                onClick={() => link.url && router.get(link.url)}
                                className={cn(
                                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    link.active
                                        ? 'bg-primary text-white'
                                        : link.url
                                          ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                          : 'cursor-not-allowed bg-gray-100 text-gray-400',
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
