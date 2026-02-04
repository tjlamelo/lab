import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ChevronDown, Edit2, Plus, Trash2, 
    FolderTree, ListTree, Eye 
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { useTranslate } from '@/lib/i18n';
import categoriesRoute from '@/routes/categories';

export default function Index({ categories }: any) {
    const { __ } = useTranslate();
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const categoriesData = Array.isArray(categories) ? categories : (categories.data || []);

    const toggleRow = (slug: string) => {
        setExpandedRow(expandedRow === slug ? null : slug);
    };

    const handleDelete = (e: React.MouseEvent, slug: string) => {
        e.stopPropagation();
        if (confirm(__('Are you sure you want to delete this category?'))) {
            router.delete(categoriesRoute.destroy(slug).url);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: __('Catalog'), href: categoriesRoute.index().url }]}>
            <Head title={__('Category Management')} />
            
            <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
                <div className="flex items-center justify-between">
                    <Heading 
                        title={__('Categories')} 
                        description={__('Organize your products into families and sub-families.')} 
                    />
                    <Link href={categoriesRoute.create().url}>
                        <Button className="gap-2 shadow-sm rounded-xl">
                            <Plus className="size-4" /> {__('New Category')}
                        </Button>
                    </Link>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-10"></TableHead>
                                <TableHead>{__('Category')}</TableHead>
                                <TableHead>{__('Parent')}</TableHead>
                                <TableHead>{__('Status')}</TableHead>
                                <TableHead className="text-right">{__('Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categoriesData.length > 0 ? (
                                categoriesData.map((cat: any) => (
                                    <React.Fragment key={cat.slug}>
                                        <TableRow 
                                            className="cursor-pointer hover:bg-muted/30 transition-colors"
                                            onClick={() => toggleRow(cat.slug)}
                                        >
                                            <TableCell>
                                                <ChevronDown className={`size-4 transition-transform ${expandedRow === cat.slug ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">
                                                        {typeof cat.name === 'object' ? (cat.name?.en || cat.name?.fr) : cat.name}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{cat.slug}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {cat.parent ? (
                                                    <Badge variant="outline" className="font-normal">
                                                        <ListTree className="size-3 mr-1 opacity-50" />
                                                        {typeof cat.parent.name === 'object' 
                                                            ? (cat.parent.name?.en || cat.parent.name?.fr) 
                                                            : cat.parent.name}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={cat.is_active ? "default" : "secondary"}>
                                                    {cat.is_active ? __('Active') : __('Inactive')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-1">
                                                    <Link href={categoriesRoute.show(cat.slug).url}>
                                                        <Button variant="ghost" size="icon" className="size-8" title={__('View details')}>
                                                            <Eye className="size-4 text-muted-foreground" />
                                                        </Button>
                                                    </Link>

                                                    <Link href={categoriesRoute.edit(cat.slug).url}>
                                                        <Button variant="ghost" size="icon" className="size-8" title={__('Edit')}>
                                                            <Edit2 className="size-4" />
                                                        </Button>
                                                    </Link>

                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                                                        onClick={(e) => handleDelete(e, cat.slug)}
                                                        title={__('Delete')}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {expandedRow === cat.slug && (
                                            <TableRow className="bg-muted/10 animate-in fade-in slide-in-from-top-2">
                                                <TableCell colSpan={5} className="p-6 border-l-4 border-l-primary">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="space-y-1">
                                                            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">{__('Description')}</h4>
                                                            <p className="text-sm text-muted-foreground italic leading-relaxed">
                                                                {typeof cat.description === 'object' 
                                                                    ? (cat.description?.en || cat.description?.fr || __('No description available.')) 
                                                                    : (cat.description || __('No description available.'))}
                                                            </p>
                                                        </div>
                                                        {cat.image && (
                                                            <div className="flex justify-end">
                                                                <img 
                                                                    src={`/storage/${cat.image}`} 
                                                                    alt="Preview" 
                                                                    className="size-16 rounded-lg object-cover border" 
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        <FolderTree className="size-10 mx-auto mb-2 opacity-20" />
                                        <p>{__('No categories found.')}</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}