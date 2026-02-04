import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    FlaskConical, Edit2, Info, ShieldCheck, Image as ImageIcon,
    Tag, ArrowLeft, Barcode, Star, Package, Trash2, Power,
    Globe, Search, Layout, Boxes
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslate } from '@/lib/i18n';
import productsRoute from '@/routes/products';

export default function Show({ product }: { product: any }) {
    const { __ } = useTranslate();
    const item = product?.data || product;
    

/* --- SEO DYNAMIQUE --- */
const currentLocale = document.documentElement.lang || 'en';
const seoData = item.meta?.seo?.[currentLocale] || {};
const description = seoData.description || item.description_translations?.[currentLocale]?.substring(0, 160);

    // Langues supportées par ton système
    const locales = ['fr', 'en', 'ar', 'ru', 'zh'];
    
    // État pour la galerie
    const [activeImg, setActiveImg] = useState(
        item.images && item.images.length > 0 ? item.images[0] : null
    );

    if (!item || !item.slug) return null;

    const handleToggle = (type: 'active' | 'featured') => {
        router.post(productsRoute.toggle(item.slug).url, { type }, { preserveScroll: true });
    };

    const handleDelete = () => {
        if (confirm(__('Move this product to trash?'))) {
            router.delete(productsRoute.destroy(item.slug).url);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: __('Inventory'), href: productsRoute.index().url },
            { title: item.name, href: '#' }
        ]}>
            <Head>
            {/* Titre de la page */}
            <title>{`${seoData.title || item.name} - ${__('Product Details')}`}</title>
            
            {/* Meta Description standard */}
            <meta name="description" content={description} />
            
            {/* Mots-clés */}
            {seoData.keywords && <meta name="keywords" content={seoData.keywords} />}

            {/* Balises Open Graph (Réseaux Sociaux) */}
            <meta property="og:title" content={seoData.title || item.name} />
            <meta property="og:description" content={description} />
            {activeImg && <meta property="og:image" content={`/storage/${activeImg}`} />}
            <meta property="og:type" content="product" />
            
            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
        </Head>

            <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
                
                {/* --- TOP BAR --- */}
                <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
                    <Link href={productsRoute.index().url} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="size-4" /> {__('Back to list')}
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggle('active')} 
                            className={item.is_active ? "text-green-600 border-green-100 bg-green-50" : ""}
                        >
                            <Power className="size-4 mr-2" /> {item.is_active ? __('Active') : __('Inactive')}
                        </Button>
                        <Link href={productsRoute.edit(item.slug).url}>
                            <Button size="sm" variant="secondary"><Edit2 className="size-4 mr-2" /> {__('Edit')}</Button>
                        </Link>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* --- COLUMN LEFT: Media & Multilingual Content --- */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Gallery Section */}
                        <div className="bg-white border rounded-3xl p-4 shadow-sm">
                            {activeImg ? (
                                <div className="space-y-4">
                                    <div className="aspect-[16/9] bg-slate-50 rounded-2xl overflow-hidden border flex items-center justify-center">
                                        <img src={`/storage/${activeImg}`} alt="Product" className="max-h-full object-contain" />
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {item.images.map((img: string, i: number) => (
                                            <button 
                                                key={i} 
                                                onClick={() => setActiveImg(img)}
                                                className={`relative size-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImg === img ? 'border-primary ring-2 ring-primary/10' : 'border-transparent opacity-60'}`}
                                            >
                                                <img src={`/storage/${img}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video bg-slate-50 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
                                    <ImageIcon className="size-12 mb-2 opacity-10" />
                                    <p className="text-sm">{__('No images available')}</p>
                                </div>
                            )}
                        </div>

                        {/* Multilingual Tabs */}
                        <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
                            <Tabs defaultValue="en" className="w-full">
                                <div className="bg-slate-50/50 border-b px-6 py-3 flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-2 font-bold text-slate-700">
                                        <Globe className="size-5 text-primary" />
                                        {__('Content Translations')}
                                    </div>
                                    <TabsList className="bg-white border">
                                        {locales.map(lang => (
                                            <TabsTrigger key={lang} value={lang} className="uppercase text-xs font-bold">
                                                {lang}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                {locales.map(lang => (
                                    <TabsContent key={lang} value={lang} className="p-6 m-0 focus-visible:ring-0">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">
                                                    {__('Product Name')} ({lang})
                                                </label>
                                                <h2 className="text-2xl font-bold text-slate-900">
                                                    {item.name_translations?.[lang] || <span className="text-slate-300 italic">No translation</span>}
                                                </h2>
                                            </div>
                                            <hr className="border-slate-100" />
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                                    {__('Description')}
                                                </label>
                                                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                    {item.description_translations?.[lang] || <span className="text-slate-300 italic">No description provided for this language.</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>

                        {/* SEO Section (Extrait du Meta) */}
                        <div className="bg-white border rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 font-bold text-slate-900 mb-6 border-b pb-4">
                                <Search className="size-5 text-blue-500" />
                                {__('SEO Configuration')}
                            </div>
                            
                            <Tabs defaultValue="en">
                                <TabsList className="mb-4">
                                    {locales.map(lang => (
                                        <TabsTrigger key={lang} value={lang} className="uppercase text-[10px]">{lang}</TabsTrigger>
                                    ))}
                                </TabsList>
                                {locales.map(lang => {
                                    const seo = item.meta?.seo?.[lang] || {};
                                    return (
                                        <TabsContent key={lang} value={lang} className="space-y-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-blue-600 text-sm font-medium mb-1 truncate">
                                                    {seo.title || item.name_translations?.[lang]}
                                                </p>
                                                <p className="text-green-700 text-xs mb-2">
                                                    {window.location.origin}/catalog/products/{item.slug}
                                                </p>
                                                <p className="text-slate-500 text-xs line-clamp-2">
                                                    {seo.description || item.description_translations?.[lang]?.substring(0, 160)}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="text-xs">
                                                    <span className="font-bold block mb-1">{__('Focus Keywords')}</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {seo.keywords ? seo.keywords.split(',').map((k: string, i: number) => (
                                                            <Badge key={i} variant="secondary" className="font-normal">{k.trim()}</Badge>
                                                        )) : <span className="text-slate-400">None</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    );
                                })}
                            </Tabs>
                        </div>
                    </div>

                    {/* --- COLUMN RIGHT: Technical Specs & Quick Info --- */}
                    <div className="space-y-6">
                        
                        {/* Status Card */}
                        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <Boxes className="absolute -right-4 -bottom-4 size-32 opacity-10 text-white" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{__('Stock Status')}</p>
                                <div className="flex items-end gap-2 mb-6">
                                    <span className="text-5xl font-black">{item.stock}</span>
                                    <span className="text-xl font-bold text-slate-400 mb-1">{item.unit || 'Units'}</span>
                                </div>
                                <div className="space-y-3 border-t border-white/10 pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">{__('Price')}</span>
                                        <span className="font-bold text-green-400">{item.price} €</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">{__('Purity')}</span>
                                        <span className="font-bold">{item.purity}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">{__('SKU')}</span>
                                        <span className="font-mono text-xs">{item.sku || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Category Card */}
                        <div className="bg-white border rounded-3xl p-6 shadow-sm">
                            <h4 className="text-xs font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
                                <Layout className="size-4" /> {__('Category')}
                            </h4>
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {item.category?.name?.substring(0, 1) || 'C'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{item.category?.name || __('Uncategorized')}</p>
                                    <p className="text-xs text-muted-foreground">{__('Product Family')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Visibility Card */}
                        <div className="bg-white border rounded-3xl p-6 shadow-sm">
                            <h4 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-wider">{__('Marketplace Visibility')}</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border">
                                    <div className="flex items-center gap-3">
                                        <Star className={`size-5 ${item.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
                                        <span className="text-sm font-medium">{__('Featured Product')}</span>
                                    </div>
                                    <Badge variant={item.is_featured ? 'default' : 'outline'}>
                                        {item.is_featured ? __('Yes') : __('No')}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-2 rounded-full ${item.is_active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                                        <span className="text-sm font-medium">{__('Online Status')}</span>
                                    </div>
                                    <span className="text-xs font-bold uppercase">{item.is_active ? __('Published') : __('Draft')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="p-4 text-center">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-loose">
                                {__('Created at')}: {item.created_at} <br />
                                {__('Last update')}: {item.updated_at}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}