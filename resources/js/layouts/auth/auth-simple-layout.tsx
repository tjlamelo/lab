import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes/shop';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6 lg:p-8">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="flex flex-col gap-8">
                    {/* Logo and Header */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <Link
                            href={home()}
                            className="group flex flex-col items-center gap-3 font-medium transition-transform hover:scale-105"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 backdrop-blur-sm transition-all group-hover:bg-primary/20 group-hover:shadow-lg">
                                <AppLogoIcon className="size-8 fill-current text-primary" />
                            </div>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                                {title}
                            </h1>
                            <p className="text-sm text-muted-foreground md:text-base">
                                {description}
                            </p>
                        </div>
                    </motion.div>

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="rounded-2xl border border-border/50 bg-card/80 p-6 shadow-xl backdrop-blur-sm md:p-8"
                    >
                        {children}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
