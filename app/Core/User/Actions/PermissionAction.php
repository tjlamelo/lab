<?php

namespace App\Core\User\Actions;

use App\Models\User;
use App\Core\User\Dto\PermissionDto;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

final class PermissionAction
{
    /**
     * Synchronise (remplace tout) les rôles et permissions d'un utilisateur
     */
    public static function sync(User $user, PermissionDto $dto): void
    {
        DB::transaction(function () use ($user, $dto) {
            // Synchronise les rôles (supprime les anciens, ajoute les nouveaux)
            $user->syncRoles($dto->roles);

            // Synchronise les permissions directes
            $user->syncPermissions($dto->permissions);

            // Force le rafraîchissement du cache pour cet utilisateur
            app(PermissionRegistrar::class)->forgetCachedPermissions();
        });
    }

    /**
     * Ajoute uniquement les nouveaux rôles/permissions sans supprimer les anciens
     */
    public static function assign(User $user, PermissionDto $dto): void
    {
        DB::transaction(function () use ($user, $dto) {
            if (!empty($dto->roles)) {
                $user->assignRole($dto->roles);
            }

            if (!empty($dto->permissions)) {
                $user->givePermissionTo($dto->permissions);
            }
        });
    }

    /**
     * Retire spécifiquement certains rôles ou permissions
     */
    public static function remove(User $user, PermissionDto $dto): void
    {
        DB::transaction(function () use ($user, $dto) {
            foreach ($dto->roles as $role) {
                $user->removeRole($role);
            }

            foreach ($dto->permissions as $permission) {
                $user->revokePermissionTo($permission);
            }
        });
    }
}