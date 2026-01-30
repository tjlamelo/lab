// components/FlashMessages.tsx
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from "sonner"; // ou useToast

export function FlashMessages() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return null;
}