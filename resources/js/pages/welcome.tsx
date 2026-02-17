import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth?.user;

    return (
        <>
            <Head title="PrimeLab Chemicals">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4 py-10">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 md:flex-row md:items-center">
                    {/* Hero text */}
                    <section className="flex-1 space-y-6">
                        <p className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300 shadow-sm backdrop-blur">
                            PrimeLab Chemicals • Secure & professional supply
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            High‑purity laboratory & specialty chemicals,
                            <span className="block text-primary">delivered with precision and discretion.</span>
                        </h1>

                        <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                            PrimeLab is your trusted platform for sourcing high‑quality chemical products for
                            research, industrial and professional use. Browse a curated catalog, manage orders,
                            track multi‑step deliveries, and pay securely in a few clicks.
                        </p>

                        <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2 sm:gap-4">
                            <div className="space-y-1 rounded-xl border border-slate-700/70 bg-slate-900/70 p-4 shadow-sm">
                                <p className="font-semibold">What we provide</p>
                                <ul className="space-y-1 text-xs text-slate-300 sm:text-sm">
                                    <li>• Laboratory & specialty chemicals catalog</li>
                                    <li>• Detailed product specs & pricing in USD</li>
                                    <li>• Secure, verified customer accounts</li>
                                </ul>
                            </div>

                            <div className="space-y-1 rounded-xl border border-slate-700/70 bg-slate-900/70 p-4 shadow-sm">
                                <p className="font-semibold">Services & experience</p>
                                <ul className="space-y-1 text-xs text-slate-300 sm:text-sm">
                                    <li>• Guided checkout with robust validation</li>
                                    <li>• Real‑time order tracking & shipment steps</li>
                                    <li>• Email notifications & invoices for each order</li>
                                </ul>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            {isAuthenticated ? (
                                <Link
                                    href={dashboard().url}
                                    className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
                                >
                                    Go to dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
                                    >
                                        Sign in to your account
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-primary hover:text-primary"
                                        >
                                            Create a new account
                                        </Link>
                                    )}
                                </>
                            )}

                            <Link
                                href="/explore"
                                className="inline-flex items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-primary/80 hover:text-primary sm:text-sm"
                            >
                                Browse the product catalog
                            </Link>
                        </div>
                    </section>

                    {/* Side info / trust card */}
                    <aside className="flex-1 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl backdrop-blur max-md:max-w-lg max-md:mx-auto">
                        <p className="text-sm font-semibold text-slate-100">
                            Why professionals choose PrimeLab
                        </p>
                        <ul className="space-y-2 text-xs text-slate-300 sm:text-sm">
                            <li>• Centralized admin panel to manage products, orders, payments and blacklist.</li>
                            <li>• Role‑based access for admin, manager and editor with secure authentication.</li>
                            <li>• Automated, customizable emails for confirmations, invoices and critical actions.</li>
                            <li>• Advanced tracking: follow each shipment step and delivery status in real time.</li>
                        </ul>
                        <p className="text-[11px] text-slate-400 sm:text-xs">
                            PrimeLab is designed for scale: optimized flows, mobile‑first checkout and a flexible
                            mail & security core to support demanding operations.
                        </p>
                    </aside>
                </div>
            </main>
        </>
    );
}
