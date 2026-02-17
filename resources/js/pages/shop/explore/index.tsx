import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Categories } from '@/components/shop/explore/categories';
import { CardProduct } from '@/components/shop/explore/card-product';
import { useTranslate } from '@/lib/i18n';
import shop from '@/routes/shop';
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
        // On garde TOUS les filtres actuels (incluant 'search')
        const newFilters = { ...filters, [key]: value };

        // Si la valeur est vide, on supprime la clé
        if (!value) delete newFilters[key];

        // Si on change de filtre, on revient à la page 1
        if (key !== 'page') delete newFilters.page;

        router.get(shop.index.url(), newFilters, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };
    const pagination = products.meta || products;

    return (
        <ShopLayout>
            <Head title={__('Explore Products')} />
            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-6xl px-4 pt-4 pb-24 md:px-6 md:pt-8 md:pb-16">
                    {/* HEADER */}
                    <header className="mb-6 space-y-3">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                                {__('Explore')}
                            </p>
                            <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                {__('Our Catalog')}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                                {__('High quality chemical solutions')}
                            </p>
                        </div>
                    </header>

                    {/* CATÉGORIES */}
                    <section className="mb-10">
                        <Categories
                            categories={categories}
                            activeId={filters.category_id}
                            onSelect={(id) => handleFilterChange('category_id', id)}
                            ensureString={ensureString}
                        />
                    </section>

                    {/* PRODUITS */}
                    <main className="space-y-8">
                        {products.data.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
                                {products.data.map((p: any) => (
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
                            <div className="rounded-[2.5rem] border-2 border-dashed py-16 text-center">
                                <p className="text-sm font-semibold text-muted-foreground">
                                    {__('No items found')}
                                </p>
                            </div>
                        )}

                        {pagination.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                {pagination.links.map((link: any, i: number) => (
                                    <button
                                        key={i}
                                        disabled={!link.url || link.active}
                                        onClick={() =>
                                            router.get(link.url, filters, {
                                                preserveScroll: true,
                                            })
                                        }
                                        className={`h-11 rounded-2xl px-5 text-sm font-bold transition-all ${
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
            </div>
        </ShopLayout>
    );
}