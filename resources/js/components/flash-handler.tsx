import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from "sonner";

export function FlashHandler() {
    // On récupère flash ET errors depuis les props
    const { flash, errors } = usePage().props as any;

    useEffect(() => {
        // 1. Gestion des messages Flash (Succès)
        if (flash?.success) {
            toast.success(flash.success);
        }

        // 2. Gestion des messages Flash (Erreur explicite)
        if (flash?.error) {
            toast.error(flash.error);
        }

        // 3. Gestion des erreurs de Validation (ex: ValidationException de OrderAction)
        // On récupère toutes les valeurs de l'objet errors et on affiche chaque message
        const errorMessages = Object.values(errors);
        if (errorMessages.length > 0) {
            errorMessages.forEach((message: any) => {
                toast.error(message);
            });
        }
        
    }, [flash, errors]); // On ajoute 'errors' dans les dépendances

    return null;
}