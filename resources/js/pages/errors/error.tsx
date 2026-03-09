import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { 
    Home, 
    AlertCircle, 
    ShieldAlert, 
    Ghost, 
    Construction, 
    Lock, 
    RefreshCcw, 
    Clock, 
    Ban 
} from 'lucide-react';
import { useTranslate } from '@/lib/i18n';

interface ErrorProps {
    status: number;
}

export default function Error({ status }: ErrorProps) {
    const { __ } = useTranslate();
    
    const content = {
        401: {
            title: __('401: Unauthorized'),
            description: __('Please log in to access this page.'),
            icon: <Lock className="w-20 h-20 text-warning" />,
        },
        403: {
            title: __('403: Access Forbidden'),
            description: __("Sorry, you don't have the necessary permissions to access this resource."),
            icon: <ShieldAlert className="w-20 h-20 text-destructive" />,
        },
        404: {
            title: __('404: Page Not Found'),
            description: __("Oops! The page you're looking for seems to have vanished into the digital void."),
            icon: <Ghost className="w-20 h-20 text-muted-foreground" />,
        },
        405: {
            title: __('405: Method Not Allowed'),
            description: __("This HTTP method is not allowed for this route. Check your request."),
            icon: <Ban className="w-20 h-20 text-destructive" />,
        },
        419: {
            title: __('419: Page Expired'),
            description: __("Your session has expired due to inactivity. Please refresh the page."),
            icon: <RefreshCcw className="w-20 h-20 text-primary animate-spin-slow" />,
        },
        429: {
            title: __('429: Too Many Requests'),
            description: __("You're moving a bit too fast! Please slow down and try again later."),
            icon: <Clock className="w-20 h-20 text-warning" />,
        },
        500: {
            title: __('500: Internal Error'),
            description: __("Our server had a little hiccup. Our technicians are already on it."),
            icon: <AlertCircle className="w-20 h-20 text-destructive" />,
        },
        503: {
            title: __('503: Maintenance'),
            description: __("We're giving the site a makeover. We'll be back very soon!"),
            icon: <Construction className="w-20 h-20 text-primary" />,
        },
    }[status] || {
        title: __('Error'),
        description: __('An unexpected error occurred.'),
        icon: <AlertCircle className="w-20 h-20" />,
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
            {/* Décoration d'arrière-plan subtile */}
            <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="mb-6 animate-in zoom-in duration-300">
                {content.icon}
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-center leading-tight">
                {content.title}
            </h1>
            
            <p className="text-muted-foreground text-center max-w-md mb-8 px-4">
                {content.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="default" size="lg" className="shadow-lg shadow-primary/20">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        {__('Back to Home')}
                    </Link>
                </Button>
                
                {status === 419 && (
                    <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        {__('Refresh Page')}
                    </Button>
                )}
            </div>
        </div>
    );
}