import { Link, usePage } from '@inertiajs/react';
import { Home, Grid, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileNav({ auth }: { auth: any }) {
    const { url, props } = usePage();
    
    // Récupération du compte (partagé via HandleInertiaRequests)
    const cartCount = (props as any).cart?.count || 0;
    const hasItems = cartCount > 0;

    const navItems = [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Explore', href: '/explore', icon: Grid },
        { label: 'Cart', href: '/cart', icon: ShoppingCart },
        { 
            label: auth.user ? 'Profile' : 'Sign in', 
            href: auth.user ? '/dashboard' : '/login', 
            icon: User 
        },
    ];

    return (
        <nav className={cn(
            "lg:hidden fixed bottom-0 left-0 right-0 z-[60]",
            "bg-white border-t border-[#EBEBEB] rounded-[28px_28px_0_0]",
            "shadow-[0_-2px_16px_0_rgba(0,0,0,0.08)]"
        )}>
            <div className="flex justify-around items-center h-[64px] px-2 py-3">
                {navItems.map((item) => {
                    const isActive = url === item.href;
                    const isCart = item.label === 'Cart';
                    
                    // Si c'est le panier et qu'il y a des items, on force l'état actif visuel
                    const showActiveColor = isActive || (isCart && hasItems);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center min-w-[64px] transition-all active:scale-90"
                        >
                            <div className={cn(
                                "transition-all duration-300 relative",
                                showActiveColor ? "text-[#5433EB] opacity-100" : "text-black opacity-35"
                            )}>
                                <item.icon 
                                    className="h-[24px] w-[24px]" 
                                    strokeWidth={showActiveColor ? 2.5 : 2} 
                                />

                                {/* Badge animé pour le panier mobile */}
                                {isCart && (
                                    <AnimatePresence mode="popLayout">
                                        {hasItems && (
                                            <motion.span
                                                key={cartCount}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.5, opacity: 0 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                                className="absolute -top-1.5 -right-1.5 bg-[#5433EB] text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
                                            >
                                                {cartCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                )}
                            </div>
                            
                            <span className={cn(
                                "text-[10px] mt-1 font-medium transition-all",
                                showActiveColor ? "text-[#5433EB] opacity-100" : "text-black opacity-35"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}