import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    FlaskConical, Edit2, Info, ShieldCheck, Activity, 
    Tag, ArrowLeft, Barcode, Eye, EyeOff, Star, Package, Trash2, Power 
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslate } from '@/lib/i18n';
import productsRoute from '@/routes/products';

export default function Show({ product }: { product: any }) {
    const { __ } = useTranslate();
    const item = product?.data || product;

    if (!item || !item.id) return null;

 const handleToggle = (type: 'active' | 'featured') => {
    // On utilise la route 'toggle' définie dans tes exports
    router.post(productsRoute.toggle(item.id).url, { type }, {
        preserveScroll: true,
    });
};

const handleDelete = () => {
    if (confirm(__('Move this product to trash?'))) {
        // On utilise 'destroy' qui génère l'URL /catalog/products/{id} avec méthode DELETE
        router.delete(productsRoute.destroy(item.id).url);
    }
};

    return (
        <AppLayout breadcrumbs={[
            { title: __('Inventory'), href: productsRoute.index().url },
            { title: item.name, href: '#' }
        ]}>
            <Head title={`${item.name} - Details`} />

            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Action Bar */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <Link href={productsRoute.index().url} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="size-4" /> {__('Back to list')}
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleToggle('active')} className={item.is_active ? "text-green-600" : "text-muted-foreground"}>
                            <Power className="size-4 mr-2" /> {item.is_active ? __('Disable') : __('Enable')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleToggle('featured')} className={item.is_featured ? "text-yellow-600" : "text-muted-foreground"}>
                            <Star className={`size-4 mr-2 ${item.is_featured ? "fill-yellow-600" : ""}`} /> {__('Feature')}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="size-4 mr-2" /> {__('Delete')}
                        </Button>
                    </div>
                </div>

                {/* Main Header Card */}
                <div className="bg-white p-8 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
                        <div className="size-24 bg-primary/5 rounded-3xl flex items-center justify-center text-primary border border-primary/10 shadow-inner">
                            <FlaskConical className="size-12" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight">{item.name}</h1>
                            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                <Badge variant="outline" className="font-mono uppercase">{item.sku || 'No SKU'}</Badge>
                                <Badge variant={item.is_active ? "default" : "secondary"}>
                                    {item.is_active ? __('Active') : __('Inactive')}
                                </Badge>
                                {item.is_featured && <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">{__('Featured')}</Badge>}
                            </div>
                        </div>
                    </div>
                    <Link href={productsRoute.edit(item.id).url}>
                        <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/20">
                            <Edit2 className="size-4" /> {__('Edit Details')}
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left side */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border rounded-2xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
                                <Info className="size-5" /> {__('Product Description')}
                            </h3>
                            <div className="text-muted-foreground leading-relaxed text-lg italic border-l-4 pl-4 border-primary/20">
                                {item.description || __('No description available for this product.')}
                            </div>
                        </div>

                        {item.meta && (
                            <div className="bg-white border rounded-2xl p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
                                    <ShieldCheck className="size-5" /> {__('Technical Specifications')}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(item.meta).map(([key, value]: any) => (
                                        <div key={key} className="flex justify-between p-3 rounded-xl bg-muted/30">
                                            <span className="text-muted-foreground font-medium capitalize">{key.replace('_', ' ')}</span>
                                            <span className="font-bold">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right side widgets */}
                    <div className="space-y-4">
                        <StatCard icon={<Tag />} label={__('Current Price')} value={`${item.price} €`} color="text-blue-500" />
                        <StatCard icon={<Package />} label={__('Inventory')} value={`${item.stock} ${item.unit || ''}`} color={item.stock > 0 ? "text-green-500" : "text-red-500"} />
                        <StatCard icon={<Barcode />} label={__('Category')} value={item.category?.name || __('Uncategorized')} color="text-purple-500" />
                        
                        <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-2 shadow-xl">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{__('Product Metadata')}</p>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">{__('Created')}</span>
                                <span>{item.created_at}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">{__('Updated')}</span>
                                <span>{item.updated_at}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ icon, label, value, color }: any) {
    return (
        <div className="bg-white border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl bg-current/10 ${color}`}>
                {React.cloneElement(icon, { className: 'size-6' })}
            </div>
            <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{label}</p>
                <p className="text-xl font-black">{value}</p>
            </div>
        </div>
    );
}