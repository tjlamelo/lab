import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';

// Importations des composants de notification
import { Toaster } from './components/ui/sonner';
import { FlashHandler } from '@/components/flash-handler';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                {/* On passe une fonction à App pour injecter nos composants dans le contexte */}
                <App {...props}>
                    {({ Component, props, key }) => (
                        <>
                            <Component key={key} {...props} />
                            <Toaster
                                position="top-right"
                                closeButton
                                richColors
                            />
                            <FlashHandler />
                        </>
                    )}
                </App>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();
