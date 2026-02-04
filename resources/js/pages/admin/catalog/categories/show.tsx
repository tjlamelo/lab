import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Edit2, ArrowLeft, Trash2, Power,
    Globe, Search, Layout, Boxes, 
    Layers, ChevronRight, Info, Image as ImageIcon
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslate } from '@/lib/i18n';
import categoriesRoute from '@/routes/categories';

export default function Show({ category }: { category: any }) {
    const { __ } = useTranslate();
    const item = category?.data || category;

    // Langues supportées
    const locales = ['fr', 'en', 'ar', 'ru', 'zh'];

    if (!item || !item.slug) return null;

    /**
     * Alterne l'état actif/inactif
     */
const handleToggle = () => {
    // On utilise categoriesRoute.toggle(item.slug).url comme pour vos autres liens
    router.post(categoriesRoute.toggle(item.slug).url, {}, { 
        preserveScroll: true 
    });
};
    const handleDelete = () => {
        if (confirm(__('Are you sure you want to delete this category?'))) {
            router.delete(categoriesRoute.destroy(item.slug).url);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: __('Catalog'), href: categoriesRoute.index().url },
            { title: item.name_translations?.en || item.name, href: '#' }
        ]}>
            <Head title={`${item.name_translations?.en || item.name} - ${__('Category Details')}`} />

            <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
                
                {/* --- TOP BAR --- */}
                <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
                    <Link href={categoriesRoute.index().url} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="size-4" /> {__('Back to list')}
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* TOGGLE STATUS BUTTON */}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleToggle}
                            className={`rounded-xl h-9 px-4 transition-all ${
                                item.is_active 
                                ? "text-green-600 border-green-100 bg-green-50 hover:bg-green-100 hover:text-green-700" 
                                : "text-slate-500 border-slate-200 bg-slate-50 hover:bg-slate-100"
                            }`}
                        >
                            <Power className={`size-3 mr-2 ${item.is_active ? "fill-green-600" : ""}`} /> 
                            {item.is_active ? __('Active') : __('Inactive')}
                        </Button>

                        <Link href={categoriesRoute.edit(item.slug).url}>
                            <Button size="sm" variant="secondary" className="rounded-xl h-9">
                                <Edit2 className="size-4 mr-2" /> {__('Edit')}
                            </Button>
                        </Link>
                        
                        <Button variant="destructive" size="sm" onClick={handleDelete} className="rounded-xl h-9">
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* --- COLUMN LEFT: Translations & Details --- */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Main Content Tabs */}
                        <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
                            <Tabs defaultValue="en" className="w-full">
                                <div className="bg-slate-50/50 border-b px-6 py-3 flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-2 font-bold text-slate-700">
                                        <Globe className="size-5 text-primary" />
                                        {__('Localizations')}
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
                                                    {__('Category Name')} ({lang})
                                                </label>
                                                <h2 className="text-2xl font-bold text-slate-900">
                                                    {item.name_translations?.[lang] || <span className="text-slate-300 italic">{__('No translation')}</span>}
                                                </h2>
                                            </div>
                                            <hr className="border-slate-100" />
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                                    {__('Description')}
                                                </label>
                                                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                                                    {item.description_translations?.[lang] || <span className="text-slate-300 italic">{__('No description provided for this language.')}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>

                        {/* Hierarchy Section */}
                        <div className="bg-white border rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 font-bold text-slate-900">
                                    <Layers className="size-5 text-indigo-500" />
                                    {__('Hierarchy & Structure')}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed">
                                <div className="size-10 rounded-full bg-white border flex items-center justify-center text-xs font-bold">1</div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">{__('Parent Category')}</p>
                                    <p className="font-semibold">{item.parent?.name || __('None (Root Category)')}</p>
                                </div>
                                {item.parent && <ChevronRight className="size-4 text-slate-300" />}
                            </div>
                        </div>
                    </div>

                    {/* --- COLUMN RIGHT: Info Cards --- */}
                    <div className="space-y-6">
                        
                        {/* Visual Preview Card */}
                        <div className="bg-white border rounded-3xl p-4 shadow-sm flex flex-col items-center justify-center aspect-square lg:aspect-auto lg:h-64">
                            {item.image ? (
                                <img 
                                    src={`/storage/${item.image}`} 
                                    className="w-full h-full object-cover rounded-2xl border" 
                                    alt="Category cover"
                                />
                            ) : (
                                <div className="text-center space-y-2">
                                    <ImageIcon className="size-12 mx-auto text-slate-200" />
                                    <p className="text-xs text-slate-400">{__('No category image')}</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Stats Card */}
                        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <Boxes className="absolute -right-4 -bottom-4 size-32 opacity-10 text-white" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{__('Statistics')}</p>
                                <div className="flex items-end gap-2 mb-6">
                                    <span className="text-5xl font-black">{item.products_count || 0}</span>
                                    <span className="text-xl font-bold text-slate-400 mb-1">{__('Products')}</span>
                                </div>
                                <div className="space-y-3 border-t border-white/10 pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">{__('Sub-categories')}</span>
                                        <span className="font-bold">{item.children_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">{__('Status')}</span>
                                        <span className={`font-bold ${item.is_active ? 'text-green-400' : 'text-slate-500'}`}>
                                            {item.is_active ? __('Online') : __('Offline')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Info */}
                        <div className="bg-white border rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
                                <Info className="size-4 text-blue-500" />
                                <span className="text-xs uppercase tracking-widest">{__('System Info')}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                                    <span>{__('Created')}</span>
                                    <span className="text-slate-600">{item.created_at}</span>
                                </div>
                                <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                                    <span>{__('Updated')}</span>
                                    <span className="text-slate-600">{item.updated_at}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}