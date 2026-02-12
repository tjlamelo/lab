import { Link } from '@inertiajs/react';
import { 
    LayoutGrid, 
    ShoppingBasket, 
    Layers, 
    Users, 
    PackageCheck, 
    Share2, 
    CreditCard, 
    MapPinned,
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

export function AppSidebar() {
    const { __ } = useTranslate();

    const mainNavItems: NavItem[] = [
        {
            title: __('Dashboard'),
            href: dashboard(),
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
        /* --- SETTINGS SECTION --- */
        {
            title: __('Payment Methods'),
            href: socials.index().url, // Update with correct route
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
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                        {/* Le switcher reste visible même en mode icône si nécessaire */}
                        <div className="flex-shrink-0 scale-90">
                             <LanguageSwitcher />
                        </div>
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