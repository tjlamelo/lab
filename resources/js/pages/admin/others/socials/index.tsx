import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Eye, 
    EyeOff, 
    GripVertical, 
    CheckCircle2,
    X,
    Link,
    ExternalLink,
    RefreshCw,
    MessageCircle,
    Facebook,
    Twitter,
    Send,
    Phone
} from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface SocialNetwork {
    id: number;
    platform: string;
    url: string;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    socials: SocialNetwork[];
}

// Définition des plateformes supportées avec leurs icônes et couleurs
const supportedPlatforms = [
    { 
        value: 'whatsapp', 
        label: 'WhatsApp', 
        icon: MessageCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        placeholder: 'https://wa.me/1234567890'
    },
    { 
        value: 'facebook', 
        label: 'Facebook', 
        icon: Facebook,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        placeholder: 'https://facebook.com/yourpage'
    },
    { 
        value: 'x', 
        label: 'X (Twitter)', 
        icon: Twitter,
        color: 'text-black dark:text-white',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        placeholder: 'https://x.com/yourhandle'
    },
    { 
        value: 'telegram', 
        label: 'Telegram', 
        icon: Send,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        placeholder: 'https://t.me/yourchannel'
    },
    { 
        value: 'signal', 
        label: 'Signal', 
        icon: Phone,
        color: 'text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        placeholder: 'https://signal.me/#p/yournumber'
    }
];

export default function SocialNetworksIndex({ socials }: Props) {
    const { __ } = useTranslate();
    const { props } = usePage();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSocial, setSelectedSocial] = useState<SocialNetwork | null>(null);
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [dragOverItem, setDragOverItem] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        platform: '',
        url: '',
        order: 0,
        is_active: true
    });

    // Récupérer les informations d'une plateforme
    const getPlatformInfo = (platformValue: string) => {
        return supportedPlatforms.find(p => p.value === platformValue) || {
            value: 'unknown',
            label: platformValue,
            icon: Link,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            placeholder: ''
        };
    };

    // Récupérer l'icône d'une plateforme
    const getPlatformIcon = (platformValue: string, size: number = 20) => {
        const platform = getPlatformInfo(platformValue);
        const IconComponent = platform.icon;
        return <IconComponent size={size} className={platform.color} />;
    };

    const resetForm = () => {
        setFormData({
            platform: '',
            url: '',
            order: 0,
            is_active: true
        });
    };

    const handleCreate = () => {
        router.post('/admin/social-networks', formData, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                resetForm();
                // Show success message (you might want to add a toast notification)
            },
            onError: (errors) => {
                console.error('Create error:', errors);
            }
        });
    };

    const handleUpdate = () => {
        if (!selectedSocial) return;
        
        setIsLoading(true);
        setProcessingId(selectedSocial.id);

        router.put(`/admin/social-networks/${selectedSocial.id}`, formData, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setSelectedSocial(null);
                resetForm();
                setIsLoading(false);
                setProcessingId(null);
            },
            onError: (errors) => {
                console.error('Update error:', errors);
                setIsLoading(false);
                setProcessingId(null);
            }
        });
    };

    const handleDelete = () => {
        if (!selectedSocial) return;
        
        router.delete(`/admin/social-networks/${selectedSocial.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedSocial(null);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
            }
        });
    };

    const handleToggle = (id: number) => {
        router.patch(`/admin/social-networks/${id}/toggle`);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverItem(index);
    };

    const handleDragLeave = () => {
        setDragOverItem(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        
        if (draggedItem !== null && draggedItem !== dropIndex) {
            const ids = socials.map(s => s.id);
            const newOrder = [...ids];
            
            // Remove dragged item
            newOrder.splice(draggedItem, 1);
            
            // Insert at drop position
            newOrder.splice(dropIndex, 0, ids[draggedItem]);
            
            router.patch('/admin/social-networks/reorder', {
                ids: newOrder
            });
        }
        
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const openEditDialog = (social: SocialNetwork) => {
        setSelectedSocial(social);
        setFormData({
            platform: social.platform,
            url: social.url,
            order: social.order,
            is_active: social.is_active
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (social: SocialNetwork) => {
        setSelectedSocial(social);
        setIsDeleteDialogOpen(true);
    };

    const refreshData = () => {
        router.reload();
    };

    return (
        <AppLayout>
            <Head title={__('Social Networks')} />

            <div className="flex-1 space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                            {__('Social Networks')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {__('Manage your social media links and their display order')}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            {__('Add Network')}
                        </Button>
                        
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={refreshData}
                            title={__('Refresh')}
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{__('Total Networks')}</p>
                                    <p className="text-2xl font-bold text-foreground">{socials.length}</p>
                                </div>
                                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Link className="h-4 w-4 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{__('Active Networks')}</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {socials.filter(s => s.is_active).length}
                                    </p>
                                </div>
                                <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{__('Inactive Networks')}</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {socials.filter(s => !s.is_active).length}
                                    </p>
                                </div>
                                <div className="h-8 w-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                    <EyeOff className="h-4 w-4 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Social Networks List */}
                <Card>
                    <CardHeader>
                        <CardTitle>{__('All Networks')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {socials.length > 0 ? (
                            <div className="divide-y divide-border">
                                {socials.map((social, index) => {
                                    const platformInfo = getPlatformInfo(social.platform);
                                    const IconComponent = platformInfo.icon;
                                    
                                    return (
                                        <div
                                            key={social.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, index)}
                                            className={cn(
                                                "flex items-center justify-between p-4 transition-colors hover:bg-muted/50 cursor-move",
                                                dragOverItem === index && "bg-muted/30 border-2 border-dashed border-primary"
                                            )}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-lg flex items-center justify-center",
                                                    platformInfo.bgColor
                                                )}>
                                                    <IconComponent size={20} className={platformInfo.color} />
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-medium text-foreground">
                                                            {platformInfo.label}
                                                        </h3>
                                                        <Badge variant={social.is_active ? "default" : "secondary"} className="text-xs">
                                                            {social.is_active ? __('Active') : __('Inactive')}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={social.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            <span className="truncate max-w-[150px]">
                                                                {social.url.replace(/^https?:\/\//, '')}
                                                            </span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditDialog(social)}
                                                    className="h-8 w-8"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggle(social.id)}
                                                    className="h-8 w-8"
                                                    title={social.is_active ? __('Deactivate') : __('Activate')}
                                                >
                                                    {social.is_active ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openDeleteDialog(social)}
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                                    <Link className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    {__('No social networks yet')}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {__('Add your first social network to get started')}
                                </p>
                                <Button
                                    onClick={() => setIsCreateDialogOpen(true)}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    {__('Add Network')}
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
                    setSelectedSocial(null);
                }
                setIsCreateDialogOpen(open);
                setIsEditDialogOpen(open);
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditDialogOpen ? __('Edit Social Network') : __('Add Social Network')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="platform">{__('Platform')}</Label>
                            <Select
                                value={formData.platform}
                                onValueChange={(value) => setFormData({ ...formData, platform: value, url: getPlatformInfo(value).placeholder })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={__('Select a platform')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {supportedPlatforms.map((platform) => {
                                        const IconComponent = platform.icon;
                                        return (
                                            <SelectItem key={platform.value} value={platform.value}>
                                                <div className="flex items-center gap-2">
                                                    <IconComponent size={16} className={platform.color} />
                                                    <span>{platform.label}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="url">{__('URL')}</Label>
                            <Input
                                id="url"
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                placeholder={
                                    formData.platform 
                                        ? getPlatformInfo(formData.platform).placeholder 
                                        : __('https://example.com/your-profile')
                                }
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="order">{__('Display Order')}</Label>
                            <Input
                                id="order"
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                placeholder={__('0 = first position')}
                                min="0"
                            />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                            <Label htmlFor="is_active" className="text-sm font-medium">
                                {__('Active')}
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
                            disabled={isLoading}
                            className="min-w-[100px]"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && setSelectedSocial(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{__('Delete Social Network')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-destructive/10 rounded-lg">
                            <div className="h-10 w-10 bg-destructive rounded-full flex items-center justify-center">
                                <Trash2 className="h-5 w-5 text-destructive-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {__('Are you sure you want to delete this social network?')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {__('This action cannot be undone.')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            {__('Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={processingId === selectedSocial?.id}
                            className="min-w-[100px]"
                        >
                            {processingId === selectedSocial?.id ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent" />
                                    <span>{__('Deleting...')}</span>
                                </div>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    {__('Delete')}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}