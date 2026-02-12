import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ShieldCheck, User as UserIcon, Save, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import adminUsersRoute from '@/routes/admin/users';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface Props {
    user: {
        id: number;
        name: string;
        roles: string[];
        permissions: string[];
    };
    availableRoles: Role[];
    availablePermissions: Permission[];
}

export default function Edit({ user, availableRoles, availablePermissions }: Props) {
    const { __ } = useTranslate();
    
    const { data, setData, put, processing } = useForm({
        roles: user.roles || [],
        permissions: user.permissions || [],
    });

    /**
     * Gère l'ajout/suppression d'un rôle avec synchronisation intelligente des permissions
     */
    const handleRoleChange = (roleName: string, checked: boolean) => {
        let newRoles = checked 
            ? [...data.roles, roleName] 
            : data.roles.filter(r => r !== roleName);

        // 1. Recalculer toutes les permissions que l'utilisateur DEVRAIT avoir via ses rôles restants
        const permissionsFromRemainingRoles = availableRoles
            .filter(role => newRoles.includes(role.name))
            .flatMap(role => role.permissions.map(p => p.name));

        let newPermissions = [...data.permissions];

        if (checked) {
            // AJOUT : On ajoute les permissions du nouveau rôle (sans doublons)
            const roleObj = availableRoles.find(r => r.name === roleName);
            const rolePerms = roleObj?.permissions.map(p => p.name) || [];
            newPermissions = Array.from(new Set([...newPermissions, ...rolePerms]));
        } else {
            // SUPPRESSION : 
            // On identifie les permissions du rôle qu'on retire
            const roleObj = availableRoles.find(r => r.name === roleName);
            const permsToRemove = roleObj?.permissions.map(p => p.name) || [];

            // On ne garde que les permissions qui :
            // - N'appartiennent PAS au rôle supprimé
            // - OU sont encore fournies par un autre rôle sélectionné
            newPermissions = newPermissions.filter(p => 
                !permsToRemove.includes(p) || permissionsFromRemainingRoles.includes(p)
            );
        }

        setData({
            ...data,
            roles: newRoles,
            permissions: newPermissions
        });
    };

    const handlePermissionChange = (permName: string, checked: boolean) => {
        const newPerms = checked
            ? [...data.permissions, permName]
            : data.permissions.filter((p: string) => p !== permName);
        
        setData('permissions', newPerms);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(adminUsersRoute.update.access(user.id).url);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: __('Users'), href: adminUsersRoute.index().url },
            { title: user.name, href: '#' }
        ]}>
            <Head title={`${__('Edit')} - ${user.name}`} />

            <div className="flex flex-col gap-6 px-4 py-8 md:px-8 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <Heading title={user.name} description={__('Fine-grained management of access rights.')} />
                    <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
                        <ArrowLeft className="size-4" /> {__('Back')}
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6">
                    
                    {/* SECTION: RÔLES */}
                    <Card className="shadow-sm border-primary/10">
                        <CardHeader className="bg-muted/30">
                            <div className="flex items-center gap-2">
                                <UserIcon className="size-5 text-primary" />
                                <CardTitle>{__('Security Roles')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {availableRoles.map((role) => (
                                    <div key={role.id} className={`flex items-center space-x-3 p-4 rounded-xl border transition-all ${data.roles.includes(role.name) ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-muted/50'}`}>
                                        <Checkbox 
                                            id={`role-${role.id}`}
                                            checked={data.roles.includes(role.name)}
                                            onCheckedChange={(checked) => handleRoleChange(role.name, !!checked)}
                                        />
                                        <Label htmlFor={`role-${role.id}`} className="font-bold cursor-pointer capitalize flex-1">
                                            {role.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* SECTION: PERMISSIONS */}
                    <Card className="shadow-sm">
                        <CardHeader className="bg-muted/30">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="size-5 text-primary" />
                                <CardTitle>{__('Individual Permissions')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6">
                                {availablePermissions.map((perm) => (
                                    <div key={perm.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/30 transition-colors">
                                        <Checkbox 
                                            id={`perm-${perm.id}`}
                                            checked={data.permissions.includes(perm.name)}
                                            onCheckedChange={(checked) => handlePermissionChange(perm.name, !!checked)}
                                        />
                                        <Label htmlFor={`perm-${perm.id}`} className="text-sm cursor-pointer capitalize flex-1">
                                            {perm.name.replace(/_/g, ' ')}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-dashed">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ShieldAlert className="size-4" />
                            {__('Changes take effect at next login.')}
                        </div>
                        <Button type="submit" disabled={processing} className="gap-2 px-8">
                            {processing ? <div className="animate-spin size-4 border-2 border-current border-t-transparent rounded-full" /> : <Save className="size-4" />}
                            {__('Save Changes')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}