// @/components/app-logo.tsx
import AppLogoIcon from './app-logo-icon';

export default function AppLogo({ showText = false }: { showText?: boolean }) {
    return (
        <div className="flex items-center">
            {/* Le carré blanc avec le logo */}
            <div className="flex aspect-square size-10 items-center justify-center rounded-md bg-white shadow-sm overflow-hidden border border-gray-100">
                <AppLogoIcon className="size-10" />
            </div>
            
            {/* On n'affiche le texte que si demandé (ex: sur mobile ou dashboard large) */}
            {showText && (
                <div className="ml-3 grid flex-1 text-left text-sm">
                    <span className="truncate leading-tight font-semibold">
                        PrimeLab Chemicals
                    </span>
                </div>
            )}
        </div>
    );
}