<?php

namespace App\Core\Pricing\Actions;

use App\Models\PaymentMethod;
use App\Core\Pricing\Dto\PaymentMethodDto;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class PaymentMethodAction
{
    /**
     * Crée un nouveau mode de paiement.
     */
    public static function create(PaymentMethodDto $dto): PaymentMethod
    {
        return DB::transaction(function () use ($dto) {
            return PaymentMethod::create([
                'name'         => $dto->name,
                'slug'         => $dto->slug ?: Str::slug($dto->name['en'] ?? $dto->name['fr']),
                'instructions' => $dto->instructions,
                'logo'         => $dto->logo,
                'is_active'    => $dto->isActive,
            ]);
        });
    }

    /**
     * Met à jour un mode de paiement existant.
     */
    public static function update(PaymentMethod $paymentMethod, PaymentMethodDto $dto): void
    {
        DB::transaction(function () use ($paymentMethod, $dto) {
            $paymentMethod->refresh()->lockForUpdate();

            $paymentMethod->update([
                'name'         => $dto->name,
                'slug'         => $dto->slug,
                'instructions' => $dto->instructions,
                'logo'         => $dto->logo,
                'is_active'    => $dto->isActive,
            ]);
        });
    }

    /**
     * Alterne l'état actif/inactif (Toggle).
     */
    public static function toggleStatus(PaymentMethod $paymentMethod): void
    {
        DB::transaction(function () use ($paymentMethod) {
            $paymentMethod->refresh()->lockForUpdate();
            $paymentMethod->update(['is_active' => !$paymentMethod->is_active]);
        });
    }

    /**
     * Supprime un mode de paiement (uniquement si aucune commande n'y est liée).
     */
    public static function delete(PaymentMethod $paymentMethod): bool
    {
        return DB::transaction(function () use ($paymentMethod) {
            // Sécurité : on vérifie si des commandes utilisent ce mode
            if ($paymentMethod->orders()->exists()) {
                // Au lieu de supprimer, on désactive pour garder l'intégrité historique
                $paymentMethod->update(['is_active' => false]);
                return false;
            }

            return $paymentMethod->delete();
        });
    }
}