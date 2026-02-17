import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutGrid, 
    ShoppingBasket, 
    Layers, 
    Users, 
    PackageCheck, 
    Share2, 
    CreditCard, 
    MapPinned,
    Mail,
    ShieldAlert,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar';

import { useTranslate } from '@/lib/i18n';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';
import LanguageSwitcher from './language-switcher';

export function AppSidebar() {
    const { __ } = useTranslate();
    const { props } = usePage();

    // Déterminer le locale courant (props > URL)
    const getLocale = (): string => {
        const propsLocale = (props as any)?.locale;
        if (typeof propsLocale === 'string') {
            return propsLocale;
        }
        if (typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            const supportedLocales = ['en', 'fr', 'ar', 'ru', 'zh'];
            if (pathParts.length > 0 && supportedLocales.includes(pathParts[0])) {
                return pathParts[0];
            }
        }
        return 'en';
    };

    const currentLocale = getLocale();

    // Bases de chemins pour éviter la duplication
    const base = `/${currentLocale}`;
    const adminBase = `${base}/admin`;

    const mainNavItems: NavItem[] = [
        {
            title: __('Dashboard'),
            href: `${base}/dashboard`,
            icon: LayoutGrid,
        },
        // --- Catalog ---
        {
            title: __('Products'),
            href: `${base}/catalog/products`,
            icon: ShoppingBasket,
        },
        {
            title: __('Categories'),
            href: `${base}/catalog/categories`,
            icon: Layers,
        },
        // --- Sales ---
        {
            title: __('Orders'),
            href: `${adminBase}/orders`,
            icon: PackageCheck,
        },
        {
            title: __('Shipment Steps'),
            href: `${adminBase}/orders`, // liste des commandes, les étapes se gèrent depuis le détail
            icon: MapPinned,
        },
        // --- Users ---
        {
            title: __('Customers'),
            href: `${adminBase}/users`,
            icon: Users,
        },
        // --- Communication ---
        {
            title: __('Mail Management'),
            href: `${adminBase}/mail`,
            icon: Mail,
        },
        // --- Settings / Security ---
        {
            title: __('Blacklist'),
            href: `${adminBase}/security/blacklist`,
            icon: ShieldAlert,
        },
        {
            title: __('Payment Methods'),
            href: `${adminBase}/payment-methods`,
            icon: CreditCard,
        },
        {
            title: __('Social Networks'),
            href: `${adminBase}/social-networks`,
            icon: Share2,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center justify-between gap-2 pr-2">
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={`${base}/dashboard`} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                      
                   
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems}/>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}