import { Link, usePage } from '@inertiajs/react';
import { Home, Grid, ShoppingCart, Tag, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav({ auth }: { auth: any }) {
    const { url } = usePage();

    // Utilisation d'un tableau d'objets pour la gestion propre des items
    const navItems = [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Explore', href: '/explore', icon: Grid },
        { label: 'Cart', href: '/cart', icon: ShoppingCart },
        // { label: 'Offers', href: '/offers', icon: Tag },
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
            "shadow-[0_-2px_16px_0_rgba(0,0,0,0.08)]" // Ombre vers le haut style Shopify
        )}>
            <div className="flex justify-around items-center h-space-64 px-2 py-3">
                {navItems.map((item) => {
                    const isActive = url === item.href;
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center min-w-[64px] transition-all active:scale-95"
                        >
                            <div className={cn(
                                "transition-all duration-200",
                                isActive ? "text-[#5433EB] opacity-100" : "text-black opacity-35"
                            )}>
                                <item.icon 
                                    className="h-[24px] w-[24px]" 
                                    strokeWidth={isActive ? 2.5 : 2} 
                                />
                            </div>
                            
                            {/* Optionnel : Masquer le texte pour un look encore plus minimaliste comme sur l'app */}
                            <span className={cn(
                                "text-[10px] mt-1 font-medium transition-all",
                                isActive ? "text-black opacity-100" : "text-black opacity-35"
                            )}>
                                {item.label}
                            </span>

                            {/* Badge pour le panier */}
                            {item.label === 'Cart' && (
                                <span className="absolute top-2 ml-4 bg-[#5433EB] text-white text-[8px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white">
                                    0
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}