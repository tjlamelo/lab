import { HTMLAttributes } from 'react';

export default function AppLogoIcon(props: HTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            src="/img/logo.png" 
            alt="Logo" 
            // object-contain évite que l'image soit rognée si elle n'est pas carrée
            className={`object-contain ${props.className}`} 
            {...props}  
        />
    );
}