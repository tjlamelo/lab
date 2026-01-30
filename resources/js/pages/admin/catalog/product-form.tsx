import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import products from '@/routes/products';
import { SUPPORTED_LANGUAGES } from '@/types';
import { useForm } from '@inertiajs/react';
import { useTranslate } from '@/lib/i18n';
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    DollarSign,
    Tag as TagIcon,
    Barcode,
    Warehouse,
    FlaskConical,
    ShieldCheck,
    Eye,
    Loader2,
    X,
    Plus,
    Activity,
    Scale,
} from 'lucide-react';
import { useState } from 'react';

export default function ProductForm({
    product,
    categories,
}: {
    product?: any;
    categories: any[];
}) {
    const { __ } = useTranslate();
    const isEditing = !!product;
    const [step, setStep] = useState(0);
    const [tagInput, setTagInput] = useState('');
    const totalSteps = SUPPORTED_LANGUAGES.length;

    const { data, setData, post, put, processing, errors } = useForm({
        category_id: product?.category_id?.toString() || '',
        name: SUPPORTED_LANGUAGES.reduce((acc, lang) => {
            acc[lang.code] = product?.name?.[lang.code] || '';
            return acc;
        }, {} as any),
        description: SUPPORTED_LANGUAGES.reduce((acc, lang) => {
            acc[lang.code] = product?.description?.[lang.code] || '';
            return acc;
        }, {} as any),
        unit: 'g',
        meta: SUPPORTED_LANGUAGES.reduce((acc, lang) => {
            acc[lang.code] = {
                title: product?.meta?.seo?.title?.[lang.code] || '',
                keywords: product?.meta?.seo?.keywords?.[lang.code] || '',
            };
            return acc;
        }, {} as any),
        brand: product?.meta?.brand || 'PrimeLab Industrial',
        gtin: product?.meta?.gtin || '',
        purity: product?.purity || '99.9%',
        slug: product?.slug || '',
        price: product?.price || 0,
        stock: product?.stock || 0,
        is_active: product?.is_active ?? true,
        is_featured: product?.is_featured ?? false,
    });

    const currentLang = SUPPORTED_LANGUAGES[step]?.code;

    const handleAddTag = () => {
        const value = tagInput.trim().replace(/,/g, '');
        if (!value) return;
        const currentTags = data.meta[currentLang].keywords
            ? data.meta[currentLang].keywords.split(',').filter(Boolean)
            : [];
        if (!currentTags.includes(value)) {
            const updatedKeywords = [...currentTags, value].join(',');
            updateMetaData('keywords', updatedKeywords);
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove: string) => {
        const updatedKeywords = data.meta[currentLang].keywords
            .split(',')
            .filter((t: string) => t !== tagToRemove)
            .join(',');
        updateMetaData('keywords', updatedKeywords);
    };

    const updateMetaData = (field: string, value: string) => {
        const newMeta = { ...data.meta };
        newMeta[currentLang][field] = value;
        setData('meta', newMeta);
    };

    const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    return (
        <TooltipProvider>
            <div className="relative mx-auto w-full max-w-6xl px-16 py-10 font-sans">
                {/* EXTERNAL NAVIGATION BUTTONS */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={prevStep}
                        disabled={step === 0}
                        className="h-12 w-12 rounded-full border border-border bg-card shadow-sm transition-all hover:text-primary disabled:opacity-30"
                    >
                        <ChevronLeft className="size-6" />
                    </Button>
                </div>

                <div className="absolute inset-y-0 right-0 flex items-center">
                    {step < totalSteps && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={nextStep}
                            className="h-12 w-12 rounded-full border border-border bg-card shadow-sm transition-all hover:text-primary"
                        >
                            <ChevronRight className="size-6" />
                        </Button>
                    )}
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        isEditing
                            ? put(products.update(product.id).url)
                            : post(products.store().url);
                    }}
                    className="space-y-6"
                >
                    {/* STEPPER */}
                    <div className="flex items-center gap-2 px-4">
                        {Array.from({ length: totalSteps + 1 }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'h-1 rounded-full transition-all duration-500',
                                    step === i
                                        ? 'flex-[3] bg-primary'
                                        : 'flex-1 bg-muted',
                                )}
                            />
                        ))}
                    </div>

                    <Card className="overflow-hidden rounded-[2.5rem] border-border bg-card shadow-2xl">
                        <CardContent className="p-0">
                            {/* HEADER */}
                            <div className="flex items-end justify-between border-b border-border/50 p-8">
                                <div>
                                    <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
                                        {step < totalSteps
                                            ? `${__('Step')} ${step + 1}: ${__('Localization')}`
                                            : __('Logistics Configuration')}
                                    </span>
                                    <h2 className="mt-1 text-3xl font-bold">
                                        {step < totalSteps
                                            ? SUPPORTED_LANGUAGES[step].label
                                            : __('Product Management')}
                                    </h2>
                                </div>
                            </div>

                            <div className="p-10">
                                {step < totalSteps ? (
                                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                                        <div className="space-y-6 lg:col-span-7">
                                            <div className="space-y-2">
                                                <Label className="ml-1 text-[11px] font-bold text-muted-foreground uppercase">
                                                    {__('Product Name')}
                                                </Label>
                                                <Input
                                                    className="h-14 rounded-xl border-2 bg-background text-lg focus-visible:ring-primary"
                                                    value={
                                                        data.name[currentLang]
                                                    }
                                                    onChange={(e) =>
                                                        setData('name', {
                                                            ...data.name,
                                                            [currentLang]:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder={__(
                                                        'Enter product name...',
                                                    )}
                                                />
                                                {/* Pour le champ Name */}
                                                {errors[
                                                    `name.${currentLang}` as keyof typeof errors
                                                ] && (
                                                    <p className="mt-1 text-xs text-destructive">
                                                        {
                                                            errors[
                                                                `name.${currentLang}` as keyof typeof errors
                                                            ]
                                                        }
                                                    </p>
                                                )}{' '}
                                            </div>

                                           <div className="space-y-2">
    <Label className="ml-1 text-[11px] font-bold text-muted-foreground uppercase">
        {__('Technical Description')}
    </Label>
    <Textarea
        rows={8}
     className={cn(
    "resize-none rounded-xl border-2 bg-background focus-visible:ring-primary transition-colors",
    (errors as any)[`description.${currentLang}`] && "border-destructive focus-visible:ring-destructive"
)}
        value={data.description[currentLang]}
        onChange={(e) =>
            setData('description', {
                ...data.description,
                [currentLang]: e.target.value,
            })
        }
        placeholder={__('Detailed specifications...')}
    />
    
    {/* Affichage du message d'erreur */}
 {(errors as any)[`description.${currentLang}`] && (
    <p className="ml-1 text-xs font-medium text-destructive">
        {(errors as any)[`description.${currentLang}`]}
    </p>
)}
</div>
                                        </div>

                                        <div className="space-y-6 lg:col-span-5">
                                            <div className="space-y-4 rounded-2xl border border-border bg-secondary/20 p-6">
                                                <Label className="flex items-center gap-2 text-[11px] font-bold uppercase">
                                                    <TagIcon className="size-3.5 text-primary" />{' '}
                                                    {__('Keywords & Tags')}
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={tagInput}
                                                        onChange={(e) =>
                                                            setTagInput(
                                                                e.target.value,
                                                            )
                                                        }
                                                        onKeyDown={(e) =>
                                                            e.key === 'Enter' &&
                                                            (e.preventDefault(),
                                                            handleAddTag())
                                                        }
                                                        placeholder={__(
                                                            'Press Enter...',
                                                        )}
                                                        className="rounded-lg border-2 bg-background"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={handleAddTag}
                                                        size="icon"
                                                        className="shrink-0 rounded-lg bg-primary"
                                                    >
                                                        <Plus className="size-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex min-h-[80px] flex-wrap gap-2">
                                                    {data.meta[
                                                        currentLang
                                                    ].keywords
                                                        ?.split(',')
                                                        .filter(Boolean)
                                                        .map(
                                                            (
                                                                tag: string,
                                                                i: number,
                                                            ) => (
                                                                <Badge
                                                                    key={i}
                                                                    className="cursor-pointer border-border bg-background py-1 text-foreground transition-colors hover:bg-destructive hover:text-white"
                                                                    onClick={() =>
                                                                        removeTag(
                                                                            tag,
                                                                        )
                                                                    }
                                                                >
                                                                    {tag}{' '}
                                                                    <X className="ml-1 size-3" />
                                                                </Badge>
                                                            ),
                                                        )}
                                                </div>
                                            </div>

                                            <div className="space-y-3 rounded-2xl border-2 border-border/60 bg-background p-6">
                                                <Label className="flex items-center gap-2 text-[11px] font-bold uppercase">
                                                    <Eye className="size-3.5 text-primary" />{' '}
                                                    {__('Search Engine Title')}
                                                </Label>
                                                <Input
                                                    className="h-10 text-xs"
                                                    placeholder={__(
                                                        'Meta Title Tag...',
                                                    )}
                                                    value={
                                                        data.meta[currentLang]
                                                            .title
                                                    }
                                                    onChange={(e) =>
                                                        updateMetaData(
                                                            'title',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                               <div className="animate-in space-y-8 duration-300 zoom-in-95 fade-in">
    {/* Première ligne : Catégorie, Prix et Unité */}
    <div className="grid gap-6 md:grid-cols-4"> {/* Changé en cols-4 pour accueillir l'unité */}
      
        <div className="space-y-2">
        <Label className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
            <FlaskConical className="size-3.5" /> {__('Category')}
        </Label>
        <Select value={data.category_id} onValueChange={(v) => setData('category_id', v)}>
            <SelectTrigger className={cn("h-12 rounded-xl border-2", errors.category_id && "border-destructive")}>
                <SelectValue placeholder={__('Select...')} />
            </SelectTrigger>
            <SelectContent> 
    {categories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name.en}
                        </SelectItem>
                    ))}

            </SelectContent>
        </Select>
        {errors.category_id && <p className="text-[10px] font-medium text-destructive">{errors.category_id}</p>}
    </div>

       <div className="space-y-2">
        <Label className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
            <DollarSign className="size-3.5" /> {__('Unit Price')}
        </Label>
        <Input
            type="number"
            className={cn("h-12 rounded-xl border-2", errors.price && "border-destructive")}
            value={data.price}
            onChange={(e) => setData('price', e.target.value)}
        />
        {errors.price && <p className="text-[10px] font-medium text-destructive">{errors.price}</p>}
    </div>
        {/* AJOUT : CHOIX DE L'UNITÉ */}
    
    
<div className="space-y-2">
    <Label className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
        <Scale className="size-3.5" /> {__('Unit')}
    </Label>
    <Select 
        value={data.unit} 
        onValueChange={(v) => setData('unit', v)}
    >
        <SelectTrigger className={cn("h-12 rounded-xl border-2", errors.unit && "border-destructive")}>
            <SelectValue placeholder={__('Select Unit')} />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="g">{__('Gram (g)')}</SelectItem>
            <SelectItem value="kg">{__('Kilogram (kg)')}</SelectItem>
            <SelectItem value="L">{__('Liter (L)')}</SelectItem>
            <SelectItem value="ml">{__('Milliliter (ml)')}</SelectItem>
            <SelectItem value="Sachet">{__('Sachet')}</SelectItem>
            <SelectItem value="Pot">{__('Pot')}</SelectItem>
            <SelectItem value="Unit">{__('Per Unit')}</SelectItem>
        </SelectContent>
    </Select>
    {errors.unit && <p className="text-[10px] font-medium text-destructive">{errors.unit}</p>}
</div>

    <div className="space-y-2">
        <Label className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
            <ShieldCheck className="size-3.5" /> {__('Purity Grade')}
        </Label>
        <Input
            className={cn("h-12 rounded-xl border-2", errors.purity && "border-destructive")}
            value={data.purity}
            onChange={(e) => setData('purity', e.target.value)}
        />
        {errors.purity && <p className="text-[10px] font-medium text-destructive">{errors.purity}</p>}
    </div>
    </div>

    {/* Section Stock et CAS */}
    <div className="grid gap-8 rounded-3xl border border-border bg-secondary/10 p-8 md:grid-cols-2">
        <div className="space-y-2">
            <Label className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                <Barcode className="size-3.5" />{' '}
                {__('GTIN / CAS Number')}
            </Label>
            <Input
                className="h-12 rounded-xl border-2 bg-background"
                value={data.gtin}
                onChange={(e) => setData('gtin', e.target.value)}
            />
        </div>
<div className="space-y-2">
    <Label className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
        <Warehouse className="size-3.5" /> {__('Current Stock')}
    </Label>
    <Input
        type="number"
        className={cn("h-12 rounded-xl border-2", errors.stock && "border-destructive")}
        value={data.stock}
        onChange={(e) => setData('stock', e.target.value)}
    />
    {errors.stock && <p className="text-[10px] font-medium text-destructive">{errors.stock}</p>}
</div>
    </div>

    {/* Status de Visibilité */}
    <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border-2 border-border/40 p-6">
        <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3">
                <Activity className="size-6 text-primary" />
            </div>
            <div>
                <p className="text-sm font-bold uppercase">
                    {__('Visibility Status')}
                </p>
                <p className="text-xs text-muted-foreground">
                    {__('Toggle availability on the public storefront')}
                </p>
            </div>
        </div>
        <div className="flex gap-8">
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase">
                    {__('Active')}
                </span>
                <Switch
                    checked={data.is_active}
                    onCheckedChange={(v) => setData('is_active', v)}
                />
            </div>
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase">
                    {__('Featured')}
                </span>
                <Switch
                    checked={data.is_featured}
                    onCheckedChange={(v) => setData('is_featured', v)}
                />
            </div>
        </div>
    </div>

    {/* Bouton de validation */}
    <div className="flex justify-center pt-4">
        <Button
            disabled={processing}
            className="h-14 rounded-2xl bg-primary px-20 text-xs font-black tracking-widest text-white uppercase shadow-xl shadow-primary/30 transition-transform hover:scale-[1.02]"
        >
            {processing ? (
                <Loader2 className="mr-3 animate-spin" />
            ) : (
                <CheckCircle2 className="mr-3 size-5" />
            )}
            {isEditing ? __('Update Product') : __('Save Product')}
        </Button>
    </div>
</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </TooltipProvider>
    );
}
