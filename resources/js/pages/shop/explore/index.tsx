import React from 'react';
import { Head, router, Link } from '@inertiajs/react'; // Ajout de Link
import { SearchBar } from '@/components/shop/search-bar';
import { Categories } from '@/components/shop/explore/categories';
import { CardProduct } from '@/components/shop/explore/card-product';
import { useTranslate } from '@/lib/i18n';
import shop from '@/routes/shop'; // Import corrigé
import ShopLayout from '@/layouts/shop/shop-layout';

interface Props {
    categories: any[];
    products: any;
    filters: any;
}

export default function ExplorePage({ categories, products, filters }: Props) {
    const { __ } = useTranslate();

    const ensureString = (val: any): string => {
        if (typeof val === 'string') return val;
        if (val && typeof val === 'object') {
            const values = Object.values(val);
            return values.length > 0 ? String(values[0]) : '';
        }
        return '';
    };

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        if (!value) delete newFilters[key];
        if (key !== 'page') delete newFilters.page;

        // Utilisation de shop.index.url()
        router.get(shop.index.url(), newFilters, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const pagination = products.meta || products;

    return (
        <ShopLayout>
            <div className="mx-auto min-h-screen max-w-7xl px-6 py-12">
                <Head title={__('Explore Products')} />

                <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground md:text-6xl">
                            {__('Our Catalog')}
                        </h1>
                        <p className="mt-2 text-lg text-muted-foreground italic">
                            {__('High quality chemical solutions')}
                        </p>
                    </div>
                    <div className="w-full md:w-96">
                        <SearchBar />
                    </div>
                </div>

                <div className="mb-16">
                    <Categories
                        categories={categories}
                        activeId={filters.category_id}
                        onSelect={(id) => handleFilterChange('category_id', id)}
                        ensureString={ensureString}
                    />
                </div>

                <main>
                    {products.data.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
                            {products.data.map((p: any) => (
                                /* Lien vers la fiche produit via shop.product.show.url */
                                <Link 
                                    key={p.id} 
                                    href={shop.product.show.url(p.slug || p.id)}
                                    className="transition-transform active:scale-95"
                                >
                                    <CardProduct 
                                        product={p} 
                                        ensureString={ensureString} 
                                        translate={__} 
                                    />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed rounded-[3rem]">
                            <p className="text-muted-foreground font-bold">{__('No items found')}</p>
                        </div>
                    )}

                    {pagination.last_page > 1 && (
                        <div className="mt-20 flex items-center justify-center gap-2">
                            {pagination.links.map((link: any, i: number) => (
                                <button
                                    key={i}
                                    disabled={!link.url || link.active}
                                    onClick={() =>
                                        router.get(link.url, filters, {
                                            preserveScroll: true,
                                        })
                                    }
                                    className={`h-12 rounded-2xl px-5 text-sm font-bold transition-all ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                            : 'border border-border bg-card hover:bg-muted'
                                    } ${!link.url ? 'opacity-20' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </ShopLayout>
    );
}