import { SearchBar } from './search-bar';
import LanguageSwitcher from '../language-switcher';

export function PageHeader() {
    return (
        <header className="w-full h-[72px] px-6 flex items-center justify-between bg-white border-b border-[#F4F4F4]">
            {/* Gauche : Bloc vide de la même largeur que la droite pour un centrage parfait */}
            <div className="flex-1 hidden lg:flex items-center">
                {/* Espace réservé pour un logo mobile ou titre si besoin */}
            </div>

       

            {/* Droite : Switcher de langue à l'extrémité */}
            <div className="flex-1 flex justify-end items-center gap-4">
                <LanguageSwitcher />
            </div>
        </header>
    );
}