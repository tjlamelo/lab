import { Link, usePage } from '@inertiajs/react';
import { Home, Grid, ShoppingCart, User } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function DesktopSidebar({ auth }: { auth: any }) {
    const { url, props } = usePage();
    
    // Récupération du compte (partagé via HandleInertiaRequests)
    const cartCount = (props as any).cart?.count || 0;
    const hasItems = cartCount > 0;

    const navItems = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/explore", icon: Grid, label: "Explore" },
    ];

    return (
        <aside className="hidden lg:flex sticky top-0 h-screen w-[4.75rem] bg-[#FCFCFC] z-40 flex-col items-center py-5 justify-between border-none">
            
            <div className="flex flex-col items-center gap-10 w-full">
                <div className="transition-transform duration-300 hover:scale-105 flex items-center justify-center w-full p-2">
                    <Link href="/" className="flex items-center justify-center">
                        <AppLogo />
                    </Link>
                </div>

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

                                <div className="pointer-events-none invisible absolute left-[calc(100%-10px)] flex items-center justify-center whitespace-nowrap rounded-full border-[0.5px] border-gray-200 bg-white px-3 py-1 opacity-0 shadow-sm transition-all duration-200 group-hover:visible group-hover:opacity-100 group-hover:left-[calc(100%+8px)] z-50">
                                    <span className="text-[12px] font-medium text-black">{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex flex-col items-center gap-4 w-full mb-4">
                
                {/* PANIER AVEC EFFET STATIQUE SI HAS_ITEMS */}
                <Link 
                    href="/cart" 
                    className={cn(
                        "relative flex items-center justify-center rounded-full transition-all duration-300 p-3",
                        // Si le panier est plein : on le rend opaque et on lui donne un fond "static"
                        // Sinon : opacité 0.35 et hover classique
                        hasItems 
                            ? "bg-[#5433EB] text-white opacity-100 shadow-md scale-100" 
                            : "bg-transparent text-black opacity-35 hover:opacity-100 hover:scale-110"
                    )}
                >
                    <ShoppingCart className="h-6 w-6" strokeWidth={hasItems ? 2.5 : 2} />
                    
                    <AnimatePresence mode="popLayout">
                        {hasItems && (
                            <motion.span
                                key={cartCount}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                // Positionnement du chiffre en haut à droite avec badge blanc/violet
                                className="absolute -top-1 -right-1 bg-white text-[#5433EB] text-[9px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-[#5433EB] shadow-sm"
                            >
                                {cartCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>

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