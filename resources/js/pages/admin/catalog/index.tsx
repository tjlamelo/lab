import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ChevronDown, Edit2, Plus, Trash2, Eye, 
    FlaskConical, PackageSearch, Info 
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { useTranslate } from '@/lib/i18n';
import productsRoute from '@/routes/products';

export default function Index({ products }: any) {
    const { __ } = useTranslate();
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const toggleRow = (slug: string) => {
        setExpandedRow(expandedRow === slug ? null : slug);
    };

    const handleToggleStatus = (e: React.MouseEvent, slug: string, type: string) => {
        e.stopPropagation(); 
        // Utilisation systématique du SLUG
        router.post(productsRoute.toggle(slug).url, { type }, { preserveScroll: true });
    };

    const handleDelete = (e: React.MouseEvent, slug: string) => {
        e.stopPropagation();
        if (confirm(__('Voulez-vous supprimer ce produit ?'))) {
            // Utilisation systématique du SLUG
            router.delete(productsRoute.destroy(slug).url);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: __('Catalogue'), href: productsRoute.index().url }]}>
            <Head title={__('Gestion des Produits')} />
            
            <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
                <div className="flex items-center justify-between">
                    <Heading title={__('Inventaire')} description={__('Gérez vos réactifs et produits chimiques.')} />
                    <Link href={productsRoute.create().url}>
                        <Button className="gap-2 shadow-sm">
                            <Plus className="size-4" /> {__('Nouveau Produit')}
                        </Button>
                    </Link>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-10"></TableHead>
                                <TableHead>{__('Produit')}</TableHead>
                                <TableHead>{__('Prix')}</TableHead>
                                <TableHead>{__('Stock')}</TableHead>
                                <TableHead>{__('Statut')}</TableHead>
                                <TableHead className="text-right">{__('Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length > 0 ? (
                                products.data.map((p: any) => (
                                    <React.Fragment key={p.slug}>
                                        <TableRow 
                                            className="cursor-pointer hover:bg-muted/30 transition-colors"
                                            onClick={() => toggleRow(p.slug)}
                                        >
                                            <TableCell>
                                                <ChevronDown className={`size-4 transition-transform ${expandedRow === p.slug ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">{p.name}</span>
                                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{p.slug}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{p.price} $</TableCell>
                                            <TableCell>
                                                <Badge variant={p.stock <= 5 ? "destructive" : "outline"}>
                                                    {p.stock} {p.unit}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    onClick={(e) => handleToggleStatus(e, p.slug, 'active')}
                                                    variant={p.is_active ? "default" : "secondary"}
                                                    className="cursor-pointer"
                                                >
                                                    {p.is_active ? __('Actif') : __('Inactif')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-1">
                                                    <Link href={productsRoute.show(p.slug).url}>
                                                        <Button variant="ghost" size="icon" className="size-8">
                                                            <Eye className="size-4" />
                                                        </Button>
                                                    </Link>
                                                    {/* ICI : On passe p.slug au lieu de p.id */}
                                                    <Link href={productsRoute.edit(p.slug).url}>
                                                        <Button variant="ghost" size="icon" className="size-8">
                                                            <Edit2 className="size-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="size-8 text-destructive" 
                                                        onClick={(e) => handleDelete(e, p.slug)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {expandedRow === p.slug && (
                                            <TableRow className="bg-muted/10 animate-in fade-in slide-in-from-top-2">
                                                <TableCell colSpan={6} className="p-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div className="space-y-1">
                                                            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">{__('Description')}</h4>
                                                            <p className="text-sm text-muted-foreground italic leading-relaxed">{p.description || __('Aucune description.')}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex flex-wrap gap-2">
                                                                <Badge variant="secondary">Pureté: {p.purity || '99%'}</Badge>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-end">
                                                            <Link href={productsRoute.show(p.slug).url}>
                                                                <Button size="sm" variant="outline" className="gap-2">
                                                                    <Info className="size-4" /> {__('Voir Fiche Complète')}
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
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        <PackageSearch className="size-10 mx-auto mb-2 opacity-20" />
                                        <p>{__('Aucun produit trouvé.')}</p>
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