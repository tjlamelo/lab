<?php

namespace App\Core\User\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;

final class UserService
{
    /**
     * Récupère la liste des utilisateurs avec pagination et filtres.
     */
    public function getAllPaginated(int $perPage = 15, ?string $search = null): LengthAwarePaginator
    {
        return User::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Récupère un utilisateur spécifique par son ID.
     */
    public function findById(int $id): User
    {
        return User::findOrFail($id);
    }

    /**
     * Change le statut d'activation d'un utilisateur (Active / Désactive).
     */
    public function toggleStatus(int $id): User
    {
        $user = $this->findById($id);
        $user->update(['is_active' => !$user->is_active]);
        
        return $user;
    }


    /**
     * Récupère uniquement les utilisateurs actifs pour les suivis de commande.
     */
    public function getActiveUsers(): Collection
    {
        return User::where('is_active', true)->get();
    }

    /**
     * Supprime un utilisateur.
     */
    public function delete(int $id): bool
    {
        return User::destroy($id) > 0;
    }
}