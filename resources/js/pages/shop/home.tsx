import React from 'react';
import ShopLayout from '@/layouts/shop/shop-layout';
import { Head, Link } from '@inertiajs/react';
import { HeroSection } from '@/components/shop/hero-section';
import shop from '@/routes/shop';

// 1. Définir l'interface pour un produit (basé sur ton modèle Laravel)
interface Product {
    id: number;
    slug: string;
    name: string;
    description: string;
    images: string[];
    sku?: string;
    purity?: string;
    color?: string;
}

// 1. L'interface change : products est directement le tableau
interface HomeProps {
    products: Product[]; // Plus de { data: ... }
}

export default function Home({ products }: HomeProps) {
    return (
        <ShopLayout>
            <Head title="Home" />

            <main className="min-h-screen bg-background flex flex-col">
                {/* Hero dynamique avec produit mis en avant */}
                {products && products.length > 0 ? (
                    <HeroSection products={products} />
                ) : (
                    <div className="flex-1 flex items-center justify-center px-6 py-16 text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                            Aucun produit trouvé pour le moment.
                        </p>
                    </div>
                )}
 
       
            </main>
        </ShopLayout>     
    );
}