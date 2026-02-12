<?php

namespace App\Core\Ordering\Services;

use App\Models\Order;
use App\Models\OrderShipmentStep;
use App\Core\Ordering\Actions\OrderShipmentStepAction;
use App\Core\Ordering\Dto\OrderShipmentStepDto;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

final class OrderShipmentStepService
{
    private const CACHE_KEY = 'order_tracking_';

    // --- OPÉRATIONS DE LECTURE (READ) ---

    /**
     * Récupère l'itinéraire complet d'une commande.
     * Utilise le cache pour optimiser les consultations répétées par le client.
     */
    public function getFullRoute(int $orderId): Collection
    {
        return Cache::remember(self::CACHE_KEY . $orderId, 3600, function () use ($orderId) {
            return OrderShipmentStep::where('order_id', $orderId)
                ->orderBy('position', 'asc')
                ->get();
        });
    }

    /**
     * Récupère uniquement la position actuelle (dernière étape atteinte).
     */
    public function getCurrentStatus(int $orderId): ?OrderShipmentStep
    {
        return OrderShipmentStep::where('order_id', $orderId)
            ->where('is_reached', true)
            ->orderBy('position', 'desc')
            ->first();
    }

    /**
     * Calcule les statistiques de progression pour l'UI (Barre de progression).
     */
    public function getProgressMetrics(int $orderId): array
    {
        $steps = $this->getFullRoute($orderId);
        $total = $steps->count();
        
        if ($total === 0) return ['percentage' => 0, 'label' => 'No tracking'];

        $reached = $steps->where('is_reached', true)->count();
        
        return [
            'percentage' => (int) (($reached / $total) * 100),
            'current_step' => $reached,
            'total_steps' => $total,
            'is_delivered' => $steps->last()->is_reached,
        ];
    }

    // --- OPÉRATIONS D'ÉCRITURE (WRITE) ---

    /**
     * Initialise un parcours complet du point A au point B.
     * Nettoie le cache après création.
     */
    public function createCustomRoute(Order $order, array $stops): void
    {
        foreach ($stops as $index => $stop) {
            $dto = new OrderShipmentStepDto(
                id: 0,
                orderId: $order->id,
                position: $index + 1,
                locationName: $stop['name'],
                statusDescription: $stop['description'] ?? null,
                latitude: $stop['lat'] ?? null,
                longitude: $stop['lng'] ?? null,
                isReached: $index === 0 // Le point de départ est validé par défaut
            );

            OrderShipmentStepAction::create($dto);
        }
        
        $this->clearCache($order->id);
    }

    /**
     * Valide l'étape suivante dans la séquence.
     */
    public function advanceShipment(int $orderId): bool
    {
        $nextStep = OrderShipmentStep::where('order_id', $orderId)
            ->where('is_reached', false)
            ->orderBy('position', 'asc')
            ->first();

        if ($nextStep) {
            OrderShipmentStepAction::markAsReached($nextStep->id);
            $this->clearCache($orderId);
            return true;
        }

        return false;
    }

    /**
     * Mise à jour manuelle d'une étape via son ID.
     */
public function updateStep(int $stepId, array $data): void
{
    try {
        // Log de l'entrée : On voit ce que le Front-end a envoyé
        Log::info("Début updateStep pour ID #{$stepId}", [
            'data_received' => $data
        ]);

        // 1. On trouve l'objet
        $step = OrderShipmentStep::findOrFail($stepId); 
        
        // 2. Préparation du DTO
        // On logge le contenu avant fusion pour comparer
        $mergedData = array_merge($step->toArray(), $data);
        $dto = OrderShipmentStepDto::fromArray($mergedData);
        
        Log::debug("DTO préparé pour l'Action", [
            'order_id' => $step->order_id,
            'location_name_dto' => $dto->locationName // Vérifie si c'est bien un array ['fr' => '...']
        ]);

        // 3. Appel de l'Action avec l'objet complet
        OrderShipmentStepAction::update($step, $dto); 
        
        // 4. Nettoyage du cache
        $this->clearCache($step->order_id);

        Log::info("UpdateStep réussi pour ID #{$stepId}");

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        Log::error("UpdateStep échoué : L'étape #{$stepId} n'existe pas en base.");
        throw $e;
    } catch (\Exception $e) {
        Log::error("Erreur critique lors de updateStep #{$stepId}", [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        throw $e;
    }
}
    /**
     * Supprime une étape et réinitialise le cache.
     */
    public function removeStep(int $stepId): void
    {
        $step = OrderShipmentStep::findOrFail($stepId);
        $orderId = $step->order_id;

        OrderShipmentStepAction::delete($stepId);
        $this->clearCache($orderId);
    }

    /**
     * Nettoyage du cache.
     */
    private function clearCache(int $orderId): void
    {
        Cache::forget(self::CACHE_KEY . $orderId);
    }
}