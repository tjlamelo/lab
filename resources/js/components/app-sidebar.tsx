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

import { useTranslate } from '@/lib/i18n'; // Assure-toi d'importer ton hook de traduction
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';
import LanguageSwitcher from './language-switcher';

// Import des routes
import productsRoute from '@/routes/products';
import categoriesRoute from '@/routes/categories';
import adminUsersRoute from '@/routes/admin/users';
import adminOrders from '@/routes/admin/orders';
import socials from '@/routes/admin/socials';
import paymentMethodsRoute from '@/routes/admin/payment-methods';

export function AppSidebar() {
    const { __ } = useTranslate();
    const { props } = usePage();
    const locale = (props as { locale?: string })?.locale ?? 'en';

    // Helper pour obtenir le locale depuis l'URL ou les props
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

    const mainNavItems: NavItem[] = [
        {
            title: __('Dashboard'),
            href: dashboard().url,
            icon: LayoutGrid,
        },
        /* --- CATALOG SECTION --- */
        {
            title: __('Products'),
            href: productsRoute.index().url,
            icon: ShoppingBasket,
        },
        {
            title: __('Categories'),
            href: categoriesRoute.index().url,
            icon: Layers,
        },
        /* --- SALES SECTION --- */
        {
            title: __('Orders'),
            href: adminOrders.index().url,
            icon: PackageCheck,
        },
        {
            title: __('Shipment Steps'),
            href: socials.index().url, // Update with correct route when ready
            icon: MapPinned,
        },
        /* --- USERS SECTION --- */
        {
            title: __('Customers'),
            href: adminUsersRoute.index().url,
            icon: Users,
        },
        /* --- COMMUNICATION SECTION --- */
        {
            title: __('Mail Management'),
            href: `/${currentLocale}/admin/mail`,
            icon: Mail,
        },
        /* --- SETTINGS SECTION --- */
        {
            title: __('Blacklist'),
            href: `/${currentLocale}/admin/security/blacklist`,
            icon: ShieldAlert,
        },
        {
            title: __('Payment Methods'),
            href: paymentMethodsRoute.index().url,
            icon: CreditCard,
        },
        {
            title: __('Social Networks'),
            href: socials.index().url,
            icon: Share2,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center justify-between gap-2 pr-2">
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                      
                   
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* <SidebarContent>
                <NavMain items={mainNavItems}/>
            </SidebarContent> */}

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}