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

    public function getFullRoute(int $orderId): Collection
    {
        return Cache::remember(self::CACHE_KEY . $orderId, 3600, function () use ($orderId) {
            return OrderShipmentStep::where('order_id', $orderId)
                ->orderBy('position', 'asc')
                ->get();
        });
    }

    public function getCurrentStatus(int $orderId): ?OrderShipmentStep
    {
        return OrderShipmentStep::where('order_id', $orderId)
            ->where('is_reached', true)
            ->orderBy('position', 'desc')
            ->first();
    }

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
            'is_delivered' => (bool) $steps->last()?->is_reached,
        ];
    }

    // --- OPÉRATIONS D'ÉCRITURE (WRITE) ---

    /**
     * Initialise un parcours complet.
     */
// Dans App\Core\Ordering\Services\OrderShipmentStepService.php

public function createCustomRoute(Order $order, array $stops): void
{
    foreach ($stops as $index => $stop) {
        // Par défaut, is_reached est false sauf si explicitement défini
        $isReached = isset($stop['is_reached']) ? (bool) $stop['is_reached'] : false;
        
        $dto = new OrderShipmentStepDto(
            id: 0,
            orderId: $order->id,
            position: $index + 1,
            // CORRECTION ICI : On cast en string et non plus en array
            locationName: (string) $stop['name'], 
            statusDescription: isset($stop['description']) ? (string) $stop['description'] : null,
            latitude: isset($stop['lat']) ? (float) $stop['lat'] : null,
            longitude: isset($stop['lng']) ? (float) $stop['lng'] : null,
            isReached: $isReached, 
            reachedAt: $isReached ? now() : null,
            estimatedArrival: isset($stop['estimated_arrival']) ? \Carbon\Carbon::parse($stop['estimated_arrival']) : null
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
            // CORRECTION : On passe l'objet $nextStep et non l'ID
            OrderShipmentStepAction::markAsReached($nextStep);
            $this->clearCache($orderId);
            return true;
        }

        return false;
    }

    /**
     * Mise à jour manuelle d'une étape.
     */
    public function updateStep(int $stepId, array $data): void
    {
        try {
            Log::info("Début updateStep pour ID #{$stepId}", ['data_received' => $data]);

            $step = OrderShipmentStep::findOrFail($stepId); 
            
            // Fusion des données existantes avec les nouvelles pour le DTO
            $mergedData = array_merge($step->toArray(), $data);
            $dto = OrderShipmentStepDto::fromArray($mergedData);
            
            OrderShipmentStepAction::update($step, $dto); 
            
            $this->clearCache($step->order_id);

            Log::info("UpdateStep réussi pour ID #{$stepId}");

        } catch (\Exception $e) {
            Log::error("Erreur critique lors de updateStep #{$stepId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Bascule l'état "reached" d'une étape.
     */
    public function toggleReached(int $stepId): void
    {
        $step = OrderShipmentStep::findOrFail($stepId);
        OrderShipmentStepAction::toggleReached($step);
        $this->clearCache($step->order_id);
    }

    /**
     * Supprime une étape.
     */
// Dans OrderShipmentStepService::removeStep()
   public function removeStep(int $stepId): void
    {
        Log::info('[OrderShipmentStepService::removeStep] ENTRY', ['step_id' => $stepId]);

        $step = OrderShipmentStep::find($stepId);

        Log::info('[OrderShipmentStepService::removeStep] AFTER find', [
            'step_id'    => $stepId,
            'found'      => $step !== null,
            'step_key'   => $step?->getKey(),
            'order_id'   => $step?->order_id,
        ]);

        if (!$step) {
            Log::warning('[OrderShipmentStepService::removeStep] Step not found', [
                'step_id'           => $stepId,
                'all_step_ids_in_db' => OrderShipmentStep::pluck('id')->toArray(),
            ]);
            throw new \Exception("Shipment step #{$stepId} not found");
        }

        $orderId = $step->order_id;
        Log::info('[OrderShipmentStepService::removeStep] Calling Action::delete', [
            'step_id' => $stepId,
            'order_id' => $orderId,
        ]);

        OrderShipmentStepAction::delete($step);

        Log::info('[OrderShipmentStepService::removeStep] SUCCESS', ['step_id' => $stepId]);
        $this->clearCache($orderId);
    }

    private function clearCache(int $orderId): void
    {
        Cache::forget(self::CACHE_KEY . $orderId);
    }
}