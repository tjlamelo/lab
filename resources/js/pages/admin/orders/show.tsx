import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { useTranslate } from '@/lib/i18n';
import adminOrders from '@/routes/admin/orders';
import { 
    ArrowLeft, Package, Truck, User, 
    CreditCard, ExternalLink, AlertTriangle, ChevronDown, CheckCircle2, 
    FileText, MapPin, Phone, Mail, Calendar,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import AppLayout from '@/layouts/app-layout';

interface StatusOption {
    value: string;
    label: string;
}

interface Props {
    order: any;
    config: {
        statuses: StatusOption[];
        payment_statuses: StatusOption[];
    };
}

export default function Show({ order, config }: Props) {
    const { __ } = useTranslate();
    const [processingType, setProcessingType] = useState<'status' | 'payment' | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'payment'>('details');

    // Mise à jour Statut Logistique
    const updateStatus = (newStatus: string) => {
        setProcessingType('status');
        router.patch(`/admin/orders/${order.id}/status`, { status: newStatus }, {
            preserveScroll: true,
            onFinish: () => setProcessingType(null)
        });
    };

    // Mise à jour Statut Paiement
    const updatePaymentStatus = (newStatus: string) => {
        setProcessingType('payment');
        router.patch(`/admin/orders/${order.id}/payment-status`, { payment_status: newStatus }, {
            preserveScroll: true,
            onFinish: () => setProcessingType(null)
        });
    };

    // Générateur de badge logistique (Status)
    const getStatusBadge = (statusValue: string) => {
        const statusObj = config.statuses.find(s => s.value === statusValue);
        const label = statusObj ? statusObj.label : statusValue;

        const styles: Record<string, string> = {
            waiting_payment: "bg-amber-50 text-amber-700 border-amber-200",
            processing: "bg-blue-50 text-blue-700 border-blue-200",
            shipping: "bg-purple-50 text-purple-700 border-purple-200",
            delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
            cancelled: "bg-red-50 text-red-700 border-red-200",
        };

        return (
            <span className={cn(
                "px-3 py-1 rounded-full text-sm font-medium border",
                styles[statusValue] || "bg-gray-50 text-gray-600"
            )}>
                {label}
            </span>
        );
    };

    // Récupération sécurisée du label de paiement
    const getPaymentLabel = (statusValue: string) => {
        const found = config.payment_statuses.find(ps => ps.value === statusValue);
        return found ? found.label : statusValue;
    };

    return (
        <AppLayout>
            <Head title={`${__('Order')} ${order.order_number}`} />

            <div className="p-6 max-w-6xl mx-auto space-y-6">
                {/* HEADER ACTIONS */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Link 
                        href={adminOrders.index.url()} 
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                        <ArrowLeft size={18} /> {__('Back to orders')}
                    </Link>
                    
                    <div className="flex items-center gap-3">
                        {/* SELECT: LOGISTIC STATUS */}
                        <div className="relative">
                            <select 
                                disabled={processingType !== null}
                                value={order.status}
                                onChange={(e) => updateStatus(e.target.value)}
                                className={cn(
                                    "appearance-none pl-4 pr-10 py-2 rounded-lg border font-medium text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                                    processingType === 'status' && "opacity-50"
                                )}
                            >
                                {config.statuses.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                        </div>

                        {/* SELECT: PAYMENT STATUS */}
                        <div className="relative">
                            <select 
                                disabled={processingType !== null}
                                value={order.payment_status}
                                onChange={(e) => updatePaymentStatus(e.target.value)}
                                className={cn(
                                    "appearance-none pl-4 pr-10 py-2 rounded-lg border font-medium text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                                    processingType === 'payment' && "opacity-50"
                                )}
                            >
                                {config.payment_statuses.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            <CreditCard size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* ORDER SUMMARY */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{order.order_number}</h2>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Calendar size={14} />
                                    {dayjs(order.created_at).format('DD MMM YYYY, HH:mm')}
                                </div>
                                {getStatusBadge(order.status)}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">{__('Total Amount')}</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {Number(order.total_amount).toLocaleString()} XAF
                            </p>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={cn(
                                "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                                activeTab === 'details'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            {__('Order Details')}
                        </button>
                        <button
                            onClick={() => setActiveTab('payment')}
                            className={cn(
                                "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                                activeTab === 'payment'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            {__('Payment Information')}
                        </button>
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT: DETAILS */}
                    <div className="lg:col-span-2">
                        {activeTab === 'details' ? (
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">{__('Order Items')}</h3>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{__('Product')}</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{__('Price')}</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{__('Quantity')}</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{__('Total')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {order.items?.map((item: any) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <Package size={18} className="text-gray-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {item.product?.name?.fr || item.product_name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900">
                                                        {Number(item.price).toLocaleString()} XAF
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                        {(item.price * item.quantity).toLocaleString()} XAF
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">{__('Subtotal')}</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {Number(order.total_amount).toLocaleString()} XAF
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-lg font-bold text-gray-900">{__('Total')}</span>
                                        <span className="text-lg font-bold text-gray-900">
                                            {Number(order.total_amount).toLocaleString()} XAF
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">{__('Payment Information')}</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-sm font-medium text-gray-500">{__('Payment Method')}</span>
                                        <span className="text-sm font-medium text-gray-900">{order.payment_method?.name}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-sm font-medium text-gray-500">{__('Payment Status')}</span>
                                        <div className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                            order.payment_status === 'paid' 
                                                ? "text-green-700 bg-green-50" 
                                                : "text-amber-700 bg-amber-50"
                                        )}>
                                            {order.payment_status === 'paid' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                            {getPaymentLabel(order.payment_status)}
                                        </div>
                                    </div>
                                    
                                    {order.payment_proof && (
                                        <div className="py-3">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium text-gray-500">{__('Payment Proof')}</span>
                                                <a 
                                                    href={`/storage/${order.payment_proof}`} 
                                                    target="_blank" 
                                                    className="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center gap-1"
                                                >
                                                    {__('View Original')} <ExternalLink size={14} />
                                                </a>
                                            </div>
                                            <div className="rounded-lg overflow-hidden border border-gray-200">
                                                <img 
                                                    src={`/storage/${order.payment_proof}`} 
                                                    className="w-full h-auto max-h-[400px] object-contain bg-gray-50"
                                                    alt="Payment Proof"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: INFO BOXES */}
                    <div className="space-y-6">
                        {/* CUSTOMER CARD */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">{__('Customer Information')}</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                                        {order.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{order.user?.name}</p>
                                        <p className="text-xs text-gray-500">{__('Customer ID')}: {order.user?.id}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail size={16} className="text-gray-400" />
                                        <span className="text-gray-700">{order.user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span className="text-gray-700">{__('Member since')}: {dayjs(order.user?.created_at).format('YYYY')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SHIPPING CARD */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">{__('Shipping Information')}</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-2">
                                    <MapPin size={18} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            {order.shipping_address?.street},<br />
                                            {order.shipping_address?.city}
                                        </p>
                                    </div>
                                </div>
                                
                                {order.shipping_address?.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-700">{order.shipping_address.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ORDER STATUS CARD */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">{__('Order Timeline')}</h3>
                            <div className="space-y-3">
                                {config.statuses.map((status, index) => {
                                    const isCompleted = config.statuses.findIndex(s => s.value === order.status) >= index;
                                    return (
                                        <div key={status.value} className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-5 h-5 rounded-full flex items-center justify-center",
                                                isCompleted ? "bg-primary text-white" : "bg-gray-200 text-gray-400"
                                            )}>
                                                {isCompleted && <CheckCircle2 size={14} />}
                                            </div>
                                            <span className={cn(
                                                "text-sm",
                                                isCompleted ? "text-gray-900 font-medium" : "text-gray-500"
                                            )}>
                                                {status.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}