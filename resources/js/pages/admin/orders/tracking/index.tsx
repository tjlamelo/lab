import React, { useState, useRef, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    Play,
    Pause,
    RefreshCw,
    Save,
    X,
    GripVertical,
    Map,
    Search,
    ArrowLeft,
    Circle,
    Info,
    ChevronRight,
    Upload
} from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import AppLayout from '@/layouts/app-layout';

interface Step {
    id: number;
    order_id: number;
    position: number;
    location_name: string;
    status_description: string | null;
    is_reached: boolean;
    reached_at: string | null;
    estimated_arrival: string | null;
    latitude?: number;
    longitude?: number;
}

interface Props {
    order: {
        id: number;
        order_number: string;
        reference: string;
    };
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
}

export default function OrderTrackingManagement({ order, steps, metrics, flash }: Props) {
    const { __ } = useTranslate();
    const { props } = usePage();
    const locale = (props as { locale?: string })?.locale ?? 'en';
    const trackingBase = `/${locale}/admin/orders/${order.id}/tracking`;
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewMapDialogOpen, setIsViewMapDialogOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [selectedStep, setSelectedStep] = useState<Step | null>(null);
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showReachedOnly, setShowReachedOnly] = useState(false);
    const [bulkImportText, setBulkImportText] = useState('');
    
    // Form state
    const [formData, setFormData] = useState({
        location_name: '',
        status_description: '',
        latitude: '',
        longitude: '',
        estimated_arrival: '',
        is_reached: false,
        position: steps.length + 1
    });

    // Filtrer les étapes selon la recherche
    const filteredSteps = steps.filter(step => {
        const matchesSearch = step.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (step.status_description && step.status_description.toLowerCase().includes(searchTerm.toLowerCase()));
        
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
            is_reached: false,
            position: steps.length + 1
        });
    };

    // Ouvrir le dialogue d'édition
    const openEditDialog = (step: Step) => {
        setSelectedStep(step);
        // Réinitialiser d'abord le formulaire pour éviter les conflits de state
        resetForm();
        // Puis mettre à jour avec les données de l'étape
        setFormData({
            location_name: step.location_name,
            status_description: step.status_description || '',
            latitude: step.latitude ? step.latitude.toString() : '',
            longitude: step.longitude ? step.longitude.toString() : '',
            estimated_arrival: step.estimated_arrival ? dayjs(step.estimated_arrival).format('YYYY-MM-DDTHH:mm') : '',
            is_reached: step.is_reached,
            position: step.position
        });
        setIsEditDialogOpen(true);
    };

    // Ouvrir le dialogue de création (toujours reset pour éviter "reached" qui reste à true)
    const openCreateDialog = () => {
        setSelectedStep(null);
        resetForm();
        // Forcer reached à false à la création (même si le state a été pollué par une édition)
        setFormData(prev => ({ ...prev, is_reached: false }));
        setIsCreateDialogOpen(true);
    };

    // Créer une nouvelle étape
    const handleCreate = () => {
        setIsProcessing(true);
        
        router.post(`${trackingBase}/initialize`, {
            stops: [{
                name: formData.location_name,
                description: formData.status_description,
                lat: formData.latitude ? parseFloat(formData.latitude) : null,
                lng: formData.longitude ? parseFloat(formData.longitude) : null,
                estimated_arrival: formData.estimated_arrival,
                // IMPORTANT: à la création, on force reached à false
                is_reached: false
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

    // Mettre à jour une étape
    const handleUpdate = () => {
        if (!selectedStep) return;
        
        setIsProcessing(true);
        
        router.put(`${trackingBase}/steps/${selectedStep.id}`, {
            location_name: formData.location_name,
            status_description: formData.status_description,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            estimated_arrival: formData.estimated_arrival,
            is_reached: formData.is_reached,
            position: formData.position
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

const handleDelete = (stepId: number) => {
    if (confirm(__('Are you sure you want to delete this step?'))) {
        const deleteUrl = `${trackingBase}/steps/${stepId}`;
        console.log('[tracking handleDelete]', {
            stepId,
            orderId: order.id,
            locale,
            trackingBase,
            deleteUrl,
        });
        router.delete(deleteUrl, {
            preserveScroll: true,
            onSuccess: () => {
                console.log('[tracking handleDelete] onSuccess');
            },
            onError: (errors) => {
                console.error('[tracking handleDelete] onError', errors);
                if (errors.error) alert(errors.error);
            },
            onFinish: () => {
                console.log('[tracking handleDelete] onFinish');
            },
        });
    }
};

    // Avancer à l'étape suivante
    const handleAdvance = () => {
        setIsProcessing(true);
        
        router.post(`${trackingBase}/advance`, {}, {
            onStart: () => setIsProcessing(true),
            onFinish: () => setIsProcessing(false),
        });
    };

    // Marquer une étape comme atteinte/non atteinte
    const handleToggleReached = (stepId: number) => {
        router.patch(`${trackingBase}/steps/${stepId}/toggle`);
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
            
            router.patch(`${trackingBase}/reorder`, {
                ids: newOrder.map(item => item.id)
            });
        }
        
        setDraggedItem(null);
    };

    // Importation en masse
    const handleBulkImport = () => {
        const lines = bulkImportText.trim().split('\n');
        const stops = lines.map(line => {
            const parts = line.split(',').map(part => part.trim());
            return {
                name: parts[0] || '',
                description: parts[1] || '',
                lat: parts[2] ? parseFloat(parts[2]) : null,
                lng: parts[3] ? parseFloat(parts[3]) : null
            };
        }).filter(stop => stop.name);
        
        if (stops.length === 0) {
            alert(__('No valid steps found in the import text'));
            return;
        }
        
        router.post(`${trackingBase}/initialize`, {
            stops
        }, {
            onSuccess: () => {
                setIsBulkImportOpen(false);
                setBulkImportText('');
            }
        });
    };

    // Initialiser une route standard
    const handleInitializeStandardRoute = () => {
        const standardStops = [
            { name: 'Entrepôt Central', description: 'Colis prêt pour expédition', lat: null, lng: null },
            { name: 'Centre de Tri', description: 'Traitement logistique', lat: null, lng: null },
            { name: 'En cours de livraison', description: 'Le livreur est en route', lat: null, lng: null },
            { name: 'Livré', description: 'Colis remis au client', lat: null, lng: null }
        ];
        
        router.post(`${trackingBase}/initialize`, {
            stops: standardStops
        });
    };

    // Afficher la carte avec les étapes
    const handleViewMap = () => {
        setIsViewMapDialogOpen(true);
    };

    return (
        <AppLayout>
            <Head title={`${__('Tracking')} - #${order.reference || order.order_number}`} />

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
                        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-2">
                            <ArrowLeft size={16} />
                            {__('Back to Order')}
                        </Button>
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Package className="text-primary size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight leading-none">
                                {__('Shipment Tracking')}
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                {__('Order')} <span className="font-mono font-bold text-primary">#{order.reference || order.order_number}</span>
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
                        
                        {steps.length > 0 && !metrics.is_delivered && (
                            <Button 
                                size="lg" 
                                onClick={handleAdvance}
                                disabled={isProcessing}
                                className="rounded-xl px-8 shadow-lg shadow-primary/20 gap-2"
                            >
                                {isProcessing ? <Loader2 className="size-5 animate-spin" /> : <Play className="size-5" />}
                                {__('Advance Progress')}
                            </Button>
                        )}
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
                                variant="outline"
                                onClick={() => setIsBulkImportOpen(true)}
                                className="gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                {__('Bulk Import')}
                            </Button>
                            
                            <Button 
                                onClick={openCreateDialog}
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
                                                                    {step.location_name}
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
                                                                    {step.status_description}
                                                                </p>
                                                            )}
                                                            
                                                            {(step.latitude || step.longitude) && (
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {step.latitude?.toFixed(6)}, {step.longitude?.toFixed(6)}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Bouton d'action rapide pour reached */}
                                                            <div className="mt-3">
                                                                <Button
                                                                    variant={step.is_reached ? "outline" : "default"}
                                                                    size="sm"
                                                                    onClick={() => handleToggleReached(step.id)}
                                                                    className="gap-2"
                                                                    disabled={isProcessing}
                                                                >
                                                                    {step.is_reached ? (
                                                                        <>
                                                                            <EyeOff className="h-4 w-4" />
                                                                            {__('Mark as Pending')}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle2 className="h-4 w-4" />
                                                                            {__('Mark as Reached')}
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
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
                                    {__('Add your first tracking step or initialize a standard route')}
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <Button
                                        onClick={openCreateDialog}
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {__('Add Step')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleInitializeStandardRoute}
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {__('Initialize Standard Route')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* SIDEBAR INFORMATION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {/* Informations supplémentaires */}
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    {__('Quick Actions')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium mb-2">{__('Next step to reach:')}</p>
                                    <p className="text-lg font-bold">
                                        {steps.find(s => !s.is_reached)?.location_name || __('All steps completed')}
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button 
                                        variant="outline" 
                                        onClick={handleViewMap}
                                        className="gap-2"
                                    >
                                        <Map className="h-4 w-4" />
                                        {__('View on Map')}
                                    </Button>
                                    
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsBulkImportOpen(true)}
                                        className="gap-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        {__('Bulk Import Steps')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div>
                        {/* Tips */}
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle>{__('Help & Tips')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    <li className="flex gap-3 text-sm text-muted-foreground">
                                        <ChevronRight size={18} className="shrink-0 text-primary" />
                                        <span>{__('Click "Advance Progress" to mark the next sequential point as reached.')}</span>
                                    </li>
                                    <li className="flex gap-3 text-sm text-muted-foreground">
                                        <ChevronRight size={18} className="shrink-0 text-primary" />
                                        <span>{__('Drag and drop steps to reorder them in the timeline.')}</span>
                                    </li>
                                    <li className="flex gap-3 text-sm text-muted-foreground">
                                        <ChevronRight size={18} className="shrink-0 text-primary" />
                                        <span>{__('Bulk import allows you to add multiple steps at once using CSV format.')}</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    // Fermer les deux dialogues et réinitialiser le state
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    resetForm();
                    setSelectedStep(null);
                } else {
                    // Ne pas permettre l'ouverture automatique via cette méthode
                    // L'ouverture doit se faire via setIsCreateDialogOpen ou setIsEditDialogOpen
                }
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
                        
                        <div className="space-y-2">
                            <Label htmlFor="position">{__('Position')}</Label>
                            <Input
                                id="position"
                                type="number"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 1 })}
                                min="1"
                            />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            {isEditDialogOpen && (
                                <>
                                    <Switch
                                        id="is_reached"
                                        checked={formData.is_reached}
                                        onCheckedChange={(checked) => {
                                            setFormData(prev => ({ ...prev, is_reached: checked }));
                                        }}
                                        disabled={isProcessing}
                                    />
                                    <Label htmlFor="is_reached" className="text-sm font-medium">
                                        {__('Mark as reached')}
                                    </Label>
                                </>
                            )}
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

            {/* Bulk Import Dialog */}
            <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{__('Bulk Import Steps')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bulk_import">{__('Import Data')}</Label>
                            <Textarea
                                id="bulk_import"
                                value={bulkImportText}
                                onChange={(e) => setBulkImportText(e.target.value)}
                                placeholder={__('Location Name, Description, Latitude, Longitude')}
                                rows={8}
                            />
                            <p className="text-xs text-muted-foreground">
                                {__('Format: Location Name, Description, Latitude, Longitude (one per line)')}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsBulkImportOpen(false)}
                        >
                            {__('Cancel')}
                        </Button>
                        <Button
                            onClick={handleBulkImport}
                            disabled={!bulkImportText.trim()}
                        >
                            {__('Import')}
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