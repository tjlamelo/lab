// src/components/page-header.tsx

import { usePage } from '@inertiajs/react';
import { LogOut, User, ChevronDown, Sun, Moon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchBar } from './search-bar';
import LanguageSwitcher from '../language-switcher';
import { logout } from '@/routes';
import { useInitials } from '@/hooks/use-initials';
import { router } from '@inertiajs/react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    currentSearch?: string;
}

function ThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 hover:bg-muted/80 transition-colors"
            aria-label="Toggle theme"
        >
            {resolvedAppearance === 'dark' ? (
                <Sun className="h-5 w-5 text-foreground" />
            ) : (
                <Moon className="h-5 w-5 text-foreground" />
            )}
        </Button>
    );
}

function UserMenu() {
    const { auth } = usePage<any>().props;
    const getInitials = useInitials();

    if (!auth?.user) {
        return null;
    }

    const user = auth.user;

    const handleLogout = () => {
        router.post(logout().url);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-9 px-2 hover:bg-muted/80 transition-colors"
                >
                    <Avatar className="h-7 w-7">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block text-sm font-medium text-foreground">
                        {user.name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function PageHeader({ currentSearch = '' }: PageHeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
            {/* 
              MOBILE-FIRST:
              - h-16 (64px) est une hauteur confortable pour mobile.
              - px-4 pour plus d'espace sur les petits écrans.
              - Layout simple : Langue | Recherche | Theme Toggle | User Menu
            */}
            <div className="flex items-center justify-between gap-2 h-16 px-4 lg:hidden">
                <LanguageSwitcher />
                <div className="flex-1 max-w-lg mx-auto">
                    <SearchBar initialValue={currentSearch} />
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <UserMenu />
                </div>
            </div>

            {/* 
              DESKTOP:
              - h-20 (80px) pour plus d'aération sur grands écrans.
              - px-8 pour des marges plus larges.
              - Layout en 3 colonnes : Vide | Recherche (centrée) | Langue + User Menu (à droite)
            */}
            <div className="hidden lg:flex items-center justify-between gap-6 h-20 px-8">
                {/* Gauche : Espace vide pour centrer la recherche */}
                <div className="flex-1"></div>

                {/* Centre : Barre de recherche avec une largeur maximale */}
                <div className="flex-[2] max-w-2xl">
                    <SearchBar initialValue={currentSearch} />
                </div>

                {/* Droite : Switcher de langue + Theme Toggle + User Menu, aligné à droite */}
                <div className="flex-1 flex items-center justify-end gap-3">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}