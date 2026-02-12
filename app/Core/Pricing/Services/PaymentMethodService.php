<?php

namespace App\Core\Pricing\Services;

use App\Models\PaymentMethod;
use App\Core\Pricing\Actions\PaymentMethodAction;
use App\Core\Pricing\Dto\PaymentMethodDto;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

final class PaymentMethodService
{
    private const CACHE_KEY = 'payment_methods_active';
    private const CACHE_TTL = 86400; // 24 heures

    // --- OPÉRATIONS DE LECTURE (READ) ---

    /**
     * Récupère tous les modes de paiement actifs pour le tunnel d'achat (Checkout).
     * Utilise le cache pour optimiser les performances.
     */
    public function getActiveMethods(): Collection
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return PaymentMethod::where('is_active', true)
                ->orderBy('id', 'asc')
                ->get();
        });
    }

    /**
     * Récupère la liste complète (actifs et inactifs) pour l'administration.
     */
    public function getAllMethods(): Collection
    {
        return PaymentMethod::orderBy('id', 'desc')->get();
    }

    /**
     * Trouve un mode de paiement par son ID ou échoue.
     */
    public function findById(int $id): PaymentMethod
    {
        return PaymentMethod::findOrFail($id);
    }

    /**
     * Trouve un mode de paiement par son slug (utile pour les redirections de paiement).
     */
    public function findBySlug(string $slug): ?PaymentMethod
    {
        return PaymentMethod::where('slug', $slug)
            ->where('is_active', true)
            ->first();
    }

    // --- OPÉRATIONS D'ÉCRITURE (WRITE) ---

    /**
     * Crée un nouveau mode de paiement et nettoie le cache.
     */
    public function createMethod(PaymentMethodDto $dto): PaymentMethod
    {
        $method = PaymentMethodAction::create($dto);
        $this->clearCache();
        
        return $method;
    }

    /**
     * Met à jour un mode de paiement et nettoie le cache.
     */
    public function updateMethod(int $id, PaymentMethodDto $dto): void
    {
        $method = $this->findById($id);
        PaymentMethodAction::update($method, $dto);
        $this->clearCache();
    }

    /**
     * Active ou désactive un mode de paiement.
     */
    public function toggleMethodStatus(int $id): void
    {
        $method = $this->findById($id);
        PaymentMethodAction::toggleStatus($method);
        $this->clearCache();
    }

    /**
     * Supprime un mode de paiement ou le désactive si lié à des commandes.
     */
    public function deleteMethod(int $id): bool
    {
        $method = $this->findById($id);
        $deleted = PaymentMethodAction::delete($method);
        $this->clearCache();

        return $deleted;
    }

    /**
     * Nettoyage manuel du cache des modes de paiement.
     */
    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}