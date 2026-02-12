// src/components/page-header.tsx

import { SearchBar } from './search-bar';
import LanguageSwitcher from '../language-switcher';

interface PageHeaderProps {
    currentSearch?: string;
}

export function PageHeader({ currentSearch = '' }: PageHeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
            {/* 
              MOBILE-FIRST:
              - h-16 (64px) est une hauteur confortable pour mobile.
              - px-4 pour plus d'espace sur les petits écrans.
              - Layout simple : Langue | Recherche
            */}
            <div className="flex items-center justify-between gap-4 h-16 px-4 lg:hidden">
                <LanguageSwitcher />
                <div className="flex-1 max-w-lg mx-auto">
                    <SearchBar initialValue={currentSearch} />
                </div>
                {/* Élément invisible pour équilibrer visuellement */}
                <div className="w-10"></div> 
            </div>

            {/* 
              DESKTOP:
              - h-20 (80px) pour plus d'aération sur grands écrans.
              - px-8 pour des marges plus larges.
              - Layout en 3 colonnes : Vide | Recherche (centrée) | Langue (à droite)
            */}
            <div className="hidden lg:flex items-center justify-between gap-6 h-20 px-8">
                {/* Gauche : Espace vide pour centrer la recherche */}
                <div className="flex-1"></div>

                {/* Centre : Barre de recherche avec une largeur maximale */}
                <div className="flex-[2] max-w-2xl">
                    <SearchBar initialValue={currentSearch} />
                </div>

                {/* Droite : Switcher de langue, aligné à droite */}
                <div className="flex-1 flex justify-end">
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    );
}