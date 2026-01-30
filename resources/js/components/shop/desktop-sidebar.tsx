import { Link, usePage } from '@inertiajs/react';
import { Home, Grid, Tag, Heart, ShoppingCart, User } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { cn } from '@/lib/utils';

export function DesktopSidebar({ auth }: { auth: any }) {
    const { url } = usePage();

    const navItems = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/categories", icon: Grid, label: "Explore" },
        { href: "/offers", icon: Tag, label: "Offers" },
        { href: "/favorites", icon: Heart, label: "Saved" },
    ];

    return (
        /* Largeur exacte : 4.75rem | Fond : #FCFCFC  */
        <aside className="hidden lg:flex sticky top-0 h-screen w-[4.75rem] bg-[#FCFCFC] z-40 flex-col items-center py-5 justify-between border-none">
            
            <div className="flex flex-col items-center gap-10 w-full">
                {/* Logo Shopify Style [cite: 8] */}
                        {/* Logo Shopify Style */}
                <div className="transition-transform duration-300 hover:scale-105 flex items-center justify-center w-full p-2">
                    <Link href="/" className="flex items-center justify-center">
                        <AppLogo /> {/* Par défaut showText est false, donc c'est centré ! */}
                    </Link>
                </div>

                {/* Navigation Principale [cite: 9, 11] */}
                <nav className="flex flex-col gap-2 w-full items-center">
                    {navItems.map((item) => {
                        const isActive = url === item.href;
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href} 
                                className="relative flex items-center justify-center group p-3 w-full"
                            >
                                <div className={cn(
                                    "transition-all duration-200",
                                    isActive 
                                        ? "text-black opacity-100 scale-105" 
                                        : "text-black opacity-35 group-hover:opacity-100 group-hover:scale-105"
                                )}>
                                    <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                                </div>

                                {/* Tooltip "Pilule"  */}
                                <div className="pointer-events-none invisible absolute left-[calc(100%-10px)] flex items-center justify-center whitespace-nowrap rounded-full border-[0.5px] border-gray-200 bg-white px-3 py-1 opacity-0 shadow-sm transition-all duration-200 group-hover:visible group-hover:opacity-100 group-hover:left-[calc(100%+8px)] z-50">
                                    <span className="text-[12px] font-medium text-black">{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Section Basse (Panier & Profil) [cite: 13, 16] */}
            <div className="flex flex-col items-center gap-4 w-full mb-4">
                {/* Panier avec opacité 0.35 par défaut [cite: 13] */}
                <Link href="/cart" className="relative group p-3 transition-all duration-200 opacity-35 hover:opacity-100 hover:scale-105">
                    <ShoppingCart className="h-6 w-6 text-black" />
                    <span className="absolute top-2 right-2 bg-[#5433EB] text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-[#FCFCFC]">
                        0
                    </span>
                </Link>

                {/* Profil avec texte "Sign in" si non connecté [cite: 16, 17] */}
                <Link href={auth.user ? "/dashboard" : "/login"} className="relative group p-3 flex flex-col items-center transition-all duration-200 opacity-35 hover:opacity-100">
                    {auth.user ? (
                        <img 
                            src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=5433EB&color=fff`} 
                            className="h-7 w-7 rounded-full object-cover border border-gray-100"
                            alt="Profil"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            <User className="h-6 w-6 text-black" />
                            <span className="text-[10px] font-medium text-black">Sign in</span>
                        </div>
                    )}
                </Link>
            </div>
        </aside>
    );
}