<?php

namespace App\Core\User\Services;

use App\Models\User;
use App\Core\User\Actions\PermissionAction;
use App\Core\User\Dto\PermissionDto;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Eloquent\Collection;

final class PermissionService
{
    /**
     * Met à jour complètement les accès d'un utilisateur (Sync).
     */
    public function updateUserAccess(int $userId, array $roles, array $permissions = []): void
    {
        $user = User::findOrFail($userId);
        $dto = new PermissionDto(roles: $roles, permissions: $permissions);
        
        PermissionAction::sync($user, $dto);
    }

    /**
     * Ajoute des droits supplémentaires sans toucher aux existants.
     */
    public function grantAccess(int $userId, array $roles, array $permissions = []): void
    {
        $user = User::findOrFail($userId);
        $dto = new PermissionDto(roles: $roles, permissions: $permissions);
        
        PermissionAction::assign($user, $dto);
    }

    /**
     * Retire des droits spécifiques.
     */
    public function revokeAccess(int $userId, array $roles, array $permissions = []): void
    {
        $user = User::findOrFail($userId);
        $dto = new PermissionDto(roles: $roles, permissions: $permissions);
        
        PermissionAction::remove($user, $dto);
    }

    /**
     * Récupère tous les rôles disponibles dans le système (pour les listes déroulantes).
     */
    public function getAllAvailableRoles(): Collection
    {
        return Role::all();
    }

    /**
     * Récupère toutes les permissions disponibles.
     */
    public function getAllAvailablePermissions(): Collection
    {
        return Permission::all();
    }

    /**
     * Vérifie si un utilisateur possède un rôle spécifique.
     */
    public function userHasRole(int $userId, string $role): bool
    {
        return User::findOrFail($userId)->hasRole($role);
    }
}