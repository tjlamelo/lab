import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

// Utils
import { SUPPORTED_LANGUAGES } from '@/types';
import { useTranslate } from '@/lib/i18n';
// Importe tes routes Wayfinder en haut du fichier
import categories from '@/routes/categories';
// Icons
import { 
    ChevronLeft, ChevronRight, CheckCircle2, Loader2, 
    FolderTree, Activity, Image as ImageIcon, X 
} from 'lucide-react';

interface CategoryFormProps {
    category?: any;
    parentCategories: any[];
}

export default function CategoryForm({ category, parentCategories }: CategoryFormProps) {
    const { __ } = useTranslate();
    const isEditing = !!category;
    const [step, setStep] = useState(0);
    const [imagePreview, setImagePreview] = useState<string | null>(category?.image ? `/storage/${category.image}` : null);
    
    const totalSteps = SUPPORTED_LANGUAGES.length;

const { data, setData, post, processing, errors } = useForm({
    _method: isEditing ? 'PUT' : 'POST',
    
    // Correction ici : utiliser name_translations au lieu de name
    name: SUPPORTED_LANGUAGES.reduce((acc, lang) => {
        acc[lang.code] = category?.name_translations?.[lang.code] || '';
        return acc;
    }, {} as Record<string, string>),

    // Correction ici : utiliser description_translations au lieu de description
    description: SUPPORTED_LANGUAGES.reduce((acc, lang) => {
        acc[lang.code] = category?.description_translations?.[lang.code] || '';
        return acc;
    }, {} as Record<string, string>),

    parent_id: category?.parent_id ? category.parent_id.toString() : 'null',
    is_active: category?.is_active ?? true,
    slug: category?.slug || '',
    image: null as File | null,
});

    const currentLang = SUPPORTED_LANGUAGES[step]?.code;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentLocale = window.location.pathname.split('/')[1];
    
    // On ne prépare le payload qu'au moment de l'envoi
    // Si l'image est une string (URL existante), on peut choisir de ne pas l'envoyer 
    // ou de l'envoyer telle quelle. Laravel gérera via le DTO.
    const payload = {
        ...data,
        parent_id: (data.parent_id === 'null' || data.parent_id === 'none') ? '' : data.parent_id,
    };

    let targetUrl = '';

    if (isEditing) {
        targetUrl = `/${currentLocale}${categories.update.url(category.slug)}`;
        // Toujours POST pour l'upload de fichiers avec Inertia + Spoofing
        post(targetUrl, {
            ...payload,
            forceFormData: true, // Crucial pour les fichiers
            onSuccess: () => console.log("✅ Mis à jour avec succès"),
            onError: (err) => console.error("❌ Erreurs :", err),
        });
    } else {
        targetUrl = `/${currentLocale}${categories.store.url()}`;
        post(targetUrl, {
            ...payload,
            forceFormData: true,
            onSuccess: () => console.log("✅ Créé avec succès"),
        });
    }
};
    const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    return (
        <TooltipProvider>
            <div className="relative mx-auto w-full max-w-6xl px-16 py-10">
                {/* NAVIGATION */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                    <Button type="button" variant="ghost" size="icon" onClick={prevStep} disabled={step === 0}
                        className="h-12 w-12 rounded-full border bg-card shadow-sm">
                        <ChevronLeft className="size-6" />
                    </Button>
                </div>

                <div className="absolute inset-y-0 right-0 flex items-center">
                    <Button type="button" variant="ghost" size="icon" onClick={nextStep} disabled={step === totalSteps}
                        className="h-12 w-12 rounded-full border bg-card shadow-sm">
                        <ChevronRight className="size-6" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="overflow-hidden rounded-[2.5rem] border-border bg-card shadow-2xl">
                        <CardContent className="p-10">
                            {step < totalSteps ? (
                                /* ÉTAPE : TRADUCTIONS */
                                <div className="space-y-6">
                                    <div className="mb-6">
                                        <Badge variant="outline" className="mb-2 uppercase">
                                            {SUPPORTED_LANGUAGES[step].label}
                                        </Badge>
                                        <h2 className="text-3xl font-bold">{__('Localization Content')}</h2>
                                    </div>

                                 <div className="space-y-2">
    <Label className="text-[11px] font-bold text-muted-foreground uppercase">{__('Category Name')}</Label>
    <Input 
        className="h-14 border-2 text-lg" 
        value={data.name[currentLang]}
        onChange={(e) => setData('name', { ...data.name, [currentLang]: e.target.value })}
        placeholder={__('Enter name...')} 
    />
    {/* On vérifie que l'erreur existe ET que c'est une string avant d'afficher */}
    {errors[`name.${currentLang}`] && typeof errors[`name.${currentLang}`] === 'string' && (
        <p className="text-xs text-destructive font-bold">{errors[`name.${currentLang}`]}</p>
    )}
</div>

                                  <div className="space-y-2">
    <Label className="text-[11px] font-bold text-muted-foreground uppercase">{__('Description')}</Label>
    <Textarea 
        rows={6} 
        className="border-2" 
        value={data.description[currentLang]}
        onChange={(e) => setData('description', { ...data.description, [currentLang]: e.target.value })} 
    />
    {errors[`description.${currentLang}`] && typeof errors[`description.${currentLang}`] === 'string' && (
        <p className="text-xs text-destructive font-bold">{errors[`description.${currentLang}`]}</p>
    )}
</div>
                                </div>
                            ) : (
                                /* ÉTAPE : CONFIGURATION GLOBALE */
                                <div className="space-y-8">
                                    <h2 className="text-3xl font-bold">{__('Global Configuration')}</h2>

                                    {/* SECTION IMAGE */}
                                    <div className="space-y-4">
                                        <Label className="flex items-center gap-2 text-[11px] font-bold uppercase">
                                            <ImageIcon className="size-3.5" /> {__('Category Image')}
                                        </Label>
                                        <div className="flex items-center gap-6">
                                            <div className="relative flex size-32 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-muted">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="size-8 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-xs cursor-pointer" />
                                                <p className="text-xs text-muted-foreground">{__('PNG, JPG or WEBP. Max 2MB.')}</p>
                                                {errors.image && <p className="text-xs text-destructive font-bold">{errors.image}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
    <Label className="flex items-center gap-2 text-[11px] font-bold uppercase text-muted-foreground">
        <FolderTree className="size-3.5" /> {__('Parent Category')}
    </Label>
  <Select value={data.parent_id} onValueChange={(val) => setData('parent_id', val)}>
    <SelectTrigger className={`h-12 border-2 ${errors.parent_id ? 'border-destructive' : ''}`}>
        <SelectValue placeholder={__('Sélectionner un parent')} />
    </SelectTrigger>
  <SelectContent>
    <SelectItem value="null">{__('Aucune (Catégorie racine)')}</SelectItem>
    {/* Ajout d'une vérification optionnelle avec ?.map ou Array.isArray */}
    {Array.isArray(parentCategories) && parentCategories.map((parent) => (
        <SelectItem key={parent.id} value={parent.id.toString()}>
            {typeof parent.name === 'object' 
                ? (parent.name?.en || parent.name?.fr) 
                : (parent.name || 'Sans nom')}
        </SelectItem>
    ))}
</SelectContent>
</Select>
    {/* AJOUT DE L'ERREUR ICI */}
    {errors.parent_id && <p className="text-xs text-destructive font-bold">{errors.parent_id}</p>}
</div>

                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase text-muted-foreground">{__('URL Slug (Manual override)')}</Label>
                                            <Input className="h-12 border-2" value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl border-2 p-6 bg-muted/30">
                                        <div className="flex items-center gap-4">
                                            <Activity className="text-primary" />
                                            <div>
                                                <p className="text-sm font-bold uppercase">{__('Status')}</p>
                                                <p className="text-xs text-muted-foreground">{__('Category visibility in catalog')}</p>
                                            </div>
                                        </div>
                                        <Switch checked={data.is_active} onCheckedChange={(v) => setData('is_active', v)} />
                                    </div>

                                    <div className="flex justify-center pt-4">
                                        <Button disabled={processing} className="h-14 rounded-2xl bg-primary px-20 font-black text-white shadow-lg hover:bg-primary/90">
                                            {processing ? <Loader2 className="mr-2 animate-spin" /> : <CheckCircle2 className="mr-2" />}
                                            {isEditing ? __('Update Category') : __('Save Category')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </form>
            </div>
        </TooltipProvider>
    );
}