import React from 'react';
import ShopLayout from '@/layouts/shop/shop-layout';
import { Head } from '@inertiajs/react';
 
import { HeroSection } from '@/components/shop/hero-section';

export default function Home() {
    return (
        <ShopLayout>
            <Head title="Home" />
            <HeroSection />
            
        </ShopLayout>     
    );
}