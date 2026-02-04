import React from 'react';
import ShopLayout from '@/layouts/shop/shop-layout';
import { Head } from '@inertiajs/react';
import { HeroSection } from '@/components/shop/hero-section';

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
    // Debug pour confirmer
    console.log("📦 Props directes :", products);

    return (
        <ShopLayout>
            <Head title="Home" />
            
            {/* On passe "products" directement car c'est lui le tableau */}
            {products && products.length > 0 ? (
                <HeroSection products={products} />
            ) : (
                <div className="p-10 text-center">Aucun produit trouvé</div>
            )}
        </ShopLayout>     
    );
}