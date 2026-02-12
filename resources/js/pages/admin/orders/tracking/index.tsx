import React, { useState, useRef, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
    MapPin, 
    Plus, 
    Trash2, 
    CheckCircle2, 
    Clock, 
    ArrowRight,
    Loader2,
    Package,
    Edit,
    Eye,
    EyeOff,
    Calendar,
    Navigation,
    MapPinned,
    Flag,
    RefreshCw,
    Map,
    Search
} from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

// Interface mise à jour pour correspondre au modèle Laravel
interface Step {
    id: number;
    location_name: { [key: string]: string }; // Objet multilingue
    status_description: { [key: string]: string } | null; // Objet multilingue ou null
    is_reached: boolean;
    reached_at: string | null;
    position: number;
    latitude?: number;
    longitude?: number;
    estimated_arrival?: string;
}

interface Props {
    order: any;
    steps: Step[];
    metrics: {
        percentage: number;
        current_step: number;
        total_steps: number;
        is_delivered: boolean;
    };
    flash?: {
        success?: string;
        error?: string;
        info?: string;
    };
    currentLocale?: string;
    availableLocales?: string[];
}

export default function TrackingManagement({ 
    order, 
    steps, 
    metrics, 
    flash,
    currentLocale = 'fr',
    availableLocales = ['fr', 'en']
}: Props) {
    const { __ } = useTranslate();
    const { props } = usePage();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewMapDialogOpen, setIsViewMapDialogOpen] = useState(false);
    const [selectedStep, setSelectedStep] = useState<Step | null>(null);
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showReachedOnly, setShowReachedOnly] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        location_name: '',
        status_description: '',
        latitude: '',
        longitude: '',
        estimated_arrival: '',
        is_reached: false
    });

    // Fonction pour obtenir le texte localisé
    const getLocalizedText = (field: { [key: string]: string } | string | null, fallback = ''): string => {
        if (!field) return fallback;
        if (typeof field === 'string') return field;
        
        // Essayer d'abord la langue actuelle, puis la langue par défaut
        return field[currentLocale] || field['fr'] || field['en'] || fallback || '';
    };

    // Filtrer les étapes selon la recherche
    const filteredSteps = steps.filter(step => {
        // Utiliser la fonction pour obtenir le texte localisé
        const locationName = getLocalizedText(step.location_name).toLowerCase();
        const statusDescription = getLocalizedText(step.status_description).toLowerCase();
        
        const matchesSearch = locationName.includes(searchTerm.toLowerCase()) ||
            statusDescription.includes(searchTerm.toLowerCase());
        
        const matchesFilter = !showReachedOnly || step.is_reached;
        
        return matchesSearch && matchesFilter;
    });

    // Réinitialiser le formulaire
    const resetForm = () => {
        setFormData({
            location_name: '',
            status_description: '',
            latitude: '',
            longitude: '',
            estimated_arrival: '',
            is_reached: false
        });
    };

    // Ouvrir le dialogue d'édition
    const openEditDialog = (step: Step) => {
        setSelectedStep(step);
        setFormData({
            location_name: getLocalizedText(step.location_name),
            status_description: getLocalizedText(step.status_description),
            latitude: step.latitude ? step.latitude.toString() : '',
            longitude: step.longitude ? step.longitude.toString() : '',
            estimated_arrival: step.estimated_arrival ? dayjs(step.estimated_arrival).format('YYYY-MM-DDTHH:mm') : '',
            is_reached: step.is_reached
        });
        setIsEditDialogOpen(true);
    };

    // Créer une nouvelle étape avec support multilingue
    const handleCreate = () => {
        setIsProcessing(true);
        
        // Créer un objet multilingue pour location_name
        const locationNameObj: { [key: string]: string } = {};
        availableLocales.forEach(locale => {
            locationNameObj[locale] = formData.location_name;
        });
        
        // Créer un objet multilingue pour status_description
        const statusDescriptionObj: { [key: string]: string } = {};
        availableLocales.forEach(locale => {
            statusDescriptionObj[locale] = formData.status_description;
        });
        
        router.post(`/admin/orders/${order.id}/tracking/initialize`, {
            stops: [{
                name: locationNameObj, // Objet multilingue
                description: statusDescriptionObj, // Objet multilingue
                lat: formData.latitude ? parseFloat(formData.latitude) : null,
                lng: formData.longitude ? parseFloat(formData.longitude) : null
            }]
        }, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                resetForm();
                setIsProcessing(false);
            },
            onError: (errors) => {
                console.error('Create error:', errors);
                setIsProcessing(false);
            }
        });
    };

    // Mettre à jour une étape avec support multilingue
const handleUpdate = () => {
    if (!selectedStep) return;
    
    setIsProcessing(true);
    
    // Vérifie bien que selectedStep.id est celui que tu vois dans l'erreur (le 3)
    router.put(`/admin/orders/${order.id}/tracking/steps/${selectedStep.id}`, {
        location_name: { fr: formData.location_name },
        status_description: { fr: formData.status_description },
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        estimated_arrival: formData.estimated_arrival,
        is_reached: formData.is_reached
    }, {
        onSuccess: () => {
            setIsEditDialogOpen(false);
            setSelectedStep(null);
            resetForm();
            setIsProcessing(false);
        },
        onError: (errors) => {
            console.error('Update error:', errors);
            setIsProcessing(false);
        }
    });
};

    // Supprimer une étape
    const handleDelete = (stepId: number) => {
        if (confirm(__('Are you sure you want to delete this step?'))) {
            router.delete(`/admin/orders/${order.id}/tracking/steps/${stepId}`, {
                preserveScroll: true
            });
        }
    };

    // Avancer à l'étape suivante
    const handleAdvance = () => {
        setIsProcessing(true);
        
        router.post(`/admin/orders/${order.id}/tracking/advance`, {}, {
            onStart: () => setIsProcessing(true),
            onFinish: () => setIsProcessing(false),
        });
    };

    // Marquer une étape comme atteinte/non atteinte
    const handleToggleReached = (stepId: number) => {
        router.patch(`/admin/orders/${order.id}/tracking/steps/${stepId}/toggle`);
    };

    // Gérer le drag & drop
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        
        if (draggedItem !== null && draggedItem !== dropIndex) {
            const newSteps = [...filteredSteps];
            const draggedStep = newSteps[draggedItem];
            
            // Supprimer l'élément dragged
            newSteps.splice(draggedItem, 1);
            
            // Insérer à la nouvelle position
            newSteps.splice(dropIndex, 0, draggedStep);
            
            // Mettre à jour les positions
            const newOrder = newSteps.map((step, index) => ({
                id: step.id,
                position: index + 1
            }));
            
            router.patch(`/admin/orders/${order.id}/tracking/reorder`, {
                ids: newOrder.map(item => item.id)
            });
        }
        
        setDraggedItem(null);
    };

    // Afficher la carte avec les étapes
    const handleViewMap = () => {
        setIsViewMapDialogOpen(true);
    };

    return (
        <AppLayout>
            <Head title={`${__('Tracking')} - #${order.reference}`} />

            {/* Messages flash */}
            {flash?.success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-md mb-4">
                    {flash.success}
                </div>
            )}
            
            {flash?.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md mb-4">
                    {flash.error}
                </div>
            )}
            
            {flash?.info && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-md mb-4">
                    {flash.info}
                </div>
            )}

            <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl shadow-sm border border-border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Package className="text-primary size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight leading-none">
                                {__('Shipment Tracking')}
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                {__('Order')} <span className="font-mono font-bold text-primary">#{order.reference}</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline"
                            size="sm"
                            onClick={handleViewMap}
                            className="rounded-xl gap-2"
                        >
                            <Map className="size-4" />
                            {__('View Map')}
                        </Button>
                        
                        <Button 
                            size="lg" 
                            onClick={handleAdvance}
                            disabled={metrics.is_delivered || isProcessing}
                            className="rounded-xl px-8 shadow-lg shadow-primary/20 gap-2"
                        >
                            {isProcessing ? <Loader2 className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}
                            {__('Advance Progress')}
                        </Button>
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-card border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{__('Progress')}</p>
                                    <p className="text-2xl font-bold">{metrics.percentage}%</p>
                                </div>
                                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Flag className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary transition-all duration-1000" 
                                        style={{ width: `${metrics.percentage}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-card border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{__('Current Step')}</p>
                                    <p className="text-2xl font-bold">{metrics.current_step}</p>
                                </div>
                                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                    <Navigation className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-card border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{__('Total Steps')}</p>
                                    <p className="text-2xl font-bold">{metrics.total_steps}</p>
                                </div>
                                <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                                    <MapPinned className="h-5 w-5 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-card border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{__('Status')}</p>
                                    <p className="text-lg font-bold">
                                        {metrics.is_delivered ? (
                                            <span className="text-green-600">{__('Delivered')}</span>
                                        ) : (
                                            <span className="text-blue-600">{__('In Transit')}</span>
                                        )}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                    {metrics.is_delivered ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <Clock className="h-5 w-5 text-blue-600" />
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SEARCH AND FILTERS */}
                <Card className="bg-card border-border">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <Input 
                                    placeholder={__('Search steps...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="show-reached"
                                    checked={showReachedOnly}
                                    onCheckedChange={setShowReachedOnly}
                                />
                                <Label htmlFor="show-reached" className="text-sm">
                                    {__('Show reached only')}
                                </Label>
                            </div>
                            
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setShowReachedOnly(false);
                                }}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {__('Reset')}
                            </Button>
                            
                            <Button 
                                onClick={() => setIsCreateDialogOpen(true)}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                {__('Add Step')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* TIMELINE */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPinned className="h-5 w-5" />
                            {__('Tracking Timeline')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredSteps.length > 0 ? (
                            <div className="p-6">
                                <div className="space-y-4">
                                    {filteredSteps.map((step, index) => (
                                        <div 
                                            key={step.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, index)}
                                            className="relative group pl-12"
                                        >
                                            {index !== filteredSteps.length - 1 && (
                                                <div className={cn(
                                                    "absolute left-[19px] top-10 bottom-[-20px] w-1 rounded-full z-0",
                                                    step.is_reached ? "bg-primary" : "bg-secondary"
                                                )} />
                                            )}

                                            <div className={cn(
                                                "absolute left-0 top-2 size-10 rounded-full border-4 border-background flex items-center justify-center z-10 shadow-sm cursor-move",
                                                step.is_reached ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                                            )}>
                                                {step.is_reached ? <CheckCircle2 size={18} /> : <span className="text-xs font-bold">{index + 1}</span>}
                                            </div>

                                            <Card className={cn(
                                                "border shadow-sm transition-all rounded-2xl overflow-hidden",
                                                step.is_reached ? "bg-primary/5 border-primary/20" : "bg-card"
                                            )}>
                                                <CardContent className="p-5">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h4 className="font-bold text-base">
                                                                    {getLocalizedText(step.location_name)}
                                                                </h4>
                                                                <Badge variant={step.is_reached ? "default" : "secondary"} className="text-xs">
                                                                    {step.is_reached ? __('Reached') : __('Pending')}
                                                                </Badge>
                                                                {step.reached_at && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        <Calendar className="h-3 w-3 mr-1" />
                                                                        {dayjs(step.reached_at).format('DD MMM YYYY')}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            
                                                            {step.status_description && (
                                                                <p className="text-sm text-muted-foreground mb-2">
                                                                    {getLocalizedText(step.status_description)}
                                                                </p>
                                                            )}
                                                            
                                                            {(step.latitude || step.longitude) && (
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {step.latitude?.toFixed(6)}, {step.longitude?.toFixed(6)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1 ml-4">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => openEditDialog(step)}
                                                                className="h-8 w-8"
                                                                title={__('Edit')}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleToggleReached(step.id)}
                                                                className="h-8 w-8"
                                                                title={step.is_reached ? __('Mark as pending') : __('Mark as reached')}
                                                            >
                                                                {step.is_reached ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                            
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(step.id)}
                                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                                title={__('Delete')}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-muted rounded-full mb-4 mx-auto">
                                    <MapPinned className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    {__('No tracking steps found')}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {__('Add your first tracking step to get started')}
                                </p>
                                <Button
                                    onClick={() => setIsCreateDialogOpen(true)}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    {__('Add Step')}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    resetForm();
                    setSelectedStep(null);
                }
                setIsCreateDialogOpen(open);
                setIsEditDialogOpen(open);
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditDialogOpen ? __('Edit Tracking Step') : __('Add Tracking Step')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="location_name">{__('Location Name')}</Label>
                            <Input
                                id="location_name"
                                value={formData.location_name}
                                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                placeholder={__('e.g., Port of Douala')}
                            />
                            <p className="text-xs text-muted-foreground">
                                {__('This will be saved in all available languages')}
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="status_description">{__('Status Description')}</Label>
                            <Textarea
                                id="status_description"
                                value={formData.status_description}
                                onChange={(e) => setFormData({ ...formData, status_description: e.target.value })}
                                placeholder={__('e.g., Package is waiting for customs clearance')}
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                {__('This will be saved in all available languages')}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">{__('Latitude')}</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    value={formData.latitude}
                                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                    placeholder={__('e.g., 4.0483')}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="longitude">{__('Longitude')}</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    value={formData.longitude}
                                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                    placeholder={__('e.g., 9.7043')}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="estimated_arrival">{__('Estimated Arrival')}</Label>
                            <Input
                                id="estimated_arrival"
                                type="datetime-local"
                                value={formData.estimated_arrival}
                                onChange={(e) => setFormData({ ...formData, estimated_arrival: e.target.value })}
                            />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_reached"
                                checked={formData.is_reached}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_reached: checked })}
                            />
                            <Label htmlFor="is_reached" className="text-sm font-medium">
                                {__('Mark as reached')}
                            </Label>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateDialogOpen(false);
                                setIsEditDialogOpen(false);
                                resetForm();
                            }}
                        >
                            {__('Cancel')}
                        </Button>
                        <Button
                            onClick={isEditDialogOpen ? handleUpdate : handleCreate}
                            disabled={isProcessing}
                            className="min-w-[100px]"
                        >
                            {isProcessing ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>{__('Saving...')}</span>
                                </div>
                            ) : (
                                <>
                                    {isEditDialogOpen ? __('Update') : __('Create')}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Map View Dialog */}
            <Dialog open={isViewMapDialogOpen} onOpenChange={setIsViewMapDialogOpen}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>{__('Tracking Map')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-8 flex items-center justify-center h-96">
                            <div className="text-center">
                                <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">{__('Map view would be displayed here')}</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {__('Integration with Google Maps or OpenStreetMap required')}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setIsViewMapDialogOpen(false)}
                            >
                                {__('Close')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}