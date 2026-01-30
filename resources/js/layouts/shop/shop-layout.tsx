import React, { PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';
import { DesktopSidebar } from '@/components/shop/desktop-sidebar';
import { MobileNav } from '@/components/shop/mobile-nav';
import { PageHeader } from '@/components/shop/page-header';

export default function ShopLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<any>().props;

    return (
        <div className="min-h-screen bg-[#FCFCFC] flex font-sans">
            {/* 1. Sidebar style Shop.app */}
            <DesktopSidebar auth={auth} />

            {/* 2. Conteneur principal */}
            <div className="relative flex-1 flex flex-col lg:p-2 lg:pl-0">
                
                <div className="relative flex-1 flex flex-col w-full min-h-full overflow-hidden">
                    
                    {/* Bordure "Soft" Shadow caractéristique */}
                    <div className="pointer-events-none absolute inset-0 z-30 rounded-[28px] border border-[#EBEBEB] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] max-lg:hidden" />

                    {/* 3. Conteneur Blanc Arrondi */}
                    <div className="relative z-10 flex-1 flex flex-col bg-white rounded-[28px] overflow-hidden">
                        
                        {/* Header avec Recherche au milieu et Langue à droite */}
                        <PageHeader />

                        {/* Zone de contenu défilante */}
                        <main className="flex-1 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </div>

                {/* Navigation Mobile */}
                <MobileNav auth={auth} />
            </div>
        </div>
    );
}