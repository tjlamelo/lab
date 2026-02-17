import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    ChevronDown, Edit2, UserPlus, Trash2, 
    UserCog, Mail, Phone, SearchX, Search, X, MonitorSmartphone
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Heading from '@/components/heading';
import { useTranslate } from '@/lib/i18n';
import adminUsersRoute from '@/routes/admin/users';

interface Props {
    users: any;
    filters: {
        search?: string;
    };
}

export default function Index({ users, filters }: Props) {
    const { __ } = useTranslate();
    const { props } = usePage();
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const getLocale = (): string => {
        const propsLocale = (props as any)?.locale;
        if (typeof propsLocale === 'string') return propsLocale;
        if (typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            const supportedLocales = ['en', 'fr', 'ar', 'ru', 'zh'];
            if (pathParts.length > 0 && supportedLocales.includes(pathParts[0])) return pathParts[0];
        }
        return 'en';
    };
    const currentLocale = getLocale();
    
    // Local state for the search input
    const [searchValue, setSearchValue] = useState(filters.search || '');

    // Debounce logic: update URL after 400ms of inactivity
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== (filters.search || '')) {
                router.get(
                    adminUsersRoute.index().url,
                    { search: searchValue },
                    { 
                        preserveState: true, 
                        replace: true, 
                        preserveScroll: true 
                    }
                );
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchValue]);

    const toggleRow = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleToggleStatus = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        router.patch(adminUsersRoute.toggle(id).url, {}, { preserveScroll: true });
    };

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm(__('Are you sure you want to delete this user?'))) {
            router.delete(adminUsersRoute.destroy(id).url);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: __('Users'), href: adminUsersRoute.index().url }]}>
            <Head title={__('User Management')} />
            
            <div className="flex flex-col gap-6 px-4 py-8 md:px-8 max-w-400 mx-auto w-full">
                
                {/* HEADER & SEARCH BAR */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Heading 
                        title={__('Users')} 
                        description={__('Manage members and their access rights.')} 
                    />
                    
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder={__('Search users...')}
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="pl-10 pr-10 border-muted-foreground/20 focus-visible:ring-primary"
                            />
                            {searchValue && (
                                <button 
                                    onClick={() => setSearchValue('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                                >
                                    <X className="size-3" />
                                </button>
                            )}
                        </div>
{/* 
                        <Button className="gap-2 shadow-sm shrink-0">
                            <UserPlus className="size-4" /> 
                            <span className="hidden sm:inline">{__('Add Member')}</span>
                        </Button> */}
                    </div>
                </div>

                {/* TABLE CARD */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-10"></TableHead>
                                <TableHead>{__('Identity')}</TableHead>
                                <TableHead>{__('Contact')}</TableHead>
                                <TableHead>{__('Status')}</TableHead>
                                <TableHead className="text-right">{__('Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length > 0 ? (
                                users.data.map((user: any) => (
                                    <React.Fragment key={user.id}>
                                        <TableRow 
                                            className={`cursor-pointer transition-colors ${expandedRow === user.id ? 'bg-muted/20' : 'hover:bg-muted/30'}`}
                                            onClick={() => toggleRow(user.id)}
                                        >
                                            <TableCell>
                                                <ChevronDown className={`size-4 transition-transform duration-200 ${expandedRow === user.id ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">{user.name}</span>
                                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">ID: #{user.id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="flex items-center gap-1.5"><Mail className="size-3 opacity-50"/> {user.email}</span>
                                                    {user.phone && <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="size-3 opacity-50"/> {user.phone}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    onClick={(e) => handleToggleStatus(e, user.id)}
                                                    variant={user.is_active ? "default" : "secondary"}
                                                    className="cursor-pointer transition-all hover:opacity-80 active:scale-95"
                                                >
                                                    {user.is_active ? __('Active') : __('Inactive')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-1">
                                                    <Link href={`/${currentLocale}/admin/users/${user.id}/devices`}>
                                                        <Button variant="ghost" size="icon" className="size-8 hover:text-primary hover:bg-primary/10" title={__('Devices')}>
                                                            <MonitorSmartphone className="size-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={adminUsersRoute.edit(user.id).url}>
                                                        <Button variant="ghost" size="icon" className="size-8 hover:text-primary hover:bg-primary/10">
                                                            <Edit2 className="size-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="size-8 text-destructive hover:bg-destructive/10" 
                                                        onClick={(e) => handleDelete(e, user.id)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {expandedRow === user.id && (
                                            <TableRow className="bg-muted/10 border-b">
                                                <TableCell colSpan={5} className="p-6">
                                                    <div className="flex justify-between items-center animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-medium uppercase text-muted-foreground tracking-wider">{__('Additional Details')}</span>
                                                            <span className="text-xs text-muted-foreground italic">
                                                                {__('Member since')} {new Date(user.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Link href={`/${currentLocale}/admin/users/${user.id}/devices`}>
                                                                <Button size="sm" variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                                                                    <MonitorSmartphone className="size-4 text-primary" /> {__('Devices')}
                                                                </Button>
                                                            </Link>
                                                            <Link href={adminUsersRoute.edit(user.id).url}>
                                                                <Button size="sm" variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                                                                    <UserCog className="size-4 text-primary" /> {__('Manage Permissions')}
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <SearchX className="size-12 opacity-20" />
                                            <div className="space-y-1">
                                                <p className="text-base font-medium">{__('No results found')}</p>
                                                <p className="text-sm opacity-70">{__('Try adjusting your search criteria.')}</p>
                                            </div>
                                            {searchValue && (
                                                <Button variant="link" onClick={() => setSearchValue('')} className="text-primary underline-offset-4">
                                                    {__('Clear search')}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* --- PAGINATION --- */}
                {users.links && users.links.length > 3 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
                        <p className="text-sm text-muted-foreground order-2 sm:order-1">
                            {__('Showing')} <span className="font-medium">{users.from}</span> {__('to')} <span className="font-medium">{users.to}</span> {__('of')} <span className="font-medium">{users.total}</span> {__('users')}
                        </p>
                        <div className="flex flex-wrap justify-center gap-1 order-1 sm:order-2">
                            {users.links.map((link: any, index: number) => {
                                if (link.url === null && link.label.includes('...')) {
                                    return <span key={index} className="px-3 py-2 text-muted-foreground">...</span>;
                                }

                                return (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        preserveScroll
                                        preserveState
                                        className={`
                                            inline-flex items-center justify-center rounded-md text-sm font-medium transition-all h-9 px-4
                                            ${link.active ? 'bg-primary text-primary-foreground shadow-md' : 'border border-input bg-background hover:bg-accent'}
                                            ${!link.url ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                                        `}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}