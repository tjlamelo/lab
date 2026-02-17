<?php

namespace App\Core\Ordering\Actions;

use App\Models\OrderShipmentStep;
use App\Core\Ordering\Dto\OrderShipmentStepDto;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

final class OrderShipmentStepAction
{
    /**
     * Crée une nouvelle étape de suivi.
     */
    public static function create(OrderShipmentStepDto $dto): OrderShipmentStep
    {
        return DB::transaction(function () use ($dto) {
            return OrderShipmentStep::create([
                'order_id'           => $dto->orderId,
                'position'           => $dto->position,
                'location_name'      => $dto->locationName,
                'status_description' => $dto->statusDescription,
                'latitude'           => $dto->latitude,
                'longitude'          => $dto->longitude,
                'is_reached'         => $dto->isReached,
                'reached_at'         => $dto->reachedAt,
                'estimated_arrival'  => $dto->estimatedArrival,
            ]);
        });
    }

    /**
     * Met à jour une étape avec verrouillage optimiste.
     */
    public static function update(OrderShipmentStep $step, OrderShipmentStepDto $dto): void
    {
        DB::transaction(function () use ($step, $dto) {
            // On récupère la version fraîche directement avec le verrou
            // Cela évite de transformer l'objet en stdClass via un Query Builder mal chaîné
            $currentStep = OrderShipmentStep::where('id', $step->id)
                ->lockForUpdate()
                ->firstOrFail();

            $currentStep->update([
                'order_id'           => $dto->orderId,
                'position'           => $dto->position,
                'location_name'      => $dto->locationName,
                'status_description' => $dto->statusDescription,
                'latitude'           => $dto->latitude,
                'longitude'          => $dto->longitude,
                'is_reached'         => $dto->isReached,
                'reached_at'         => $dto->reachedAt,
                'estimated_arrival'  => $dto->estimatedArrival,
            ]);
        });
    }

    /**
     * Valide le passage à une étape.
     */
    public static function markAsReached(OrderShipmentStep $step, ?Carbon $reachedAt = null): void
    {
        DB::transaction(function () use ($step, $reachedAt) {
            $currentStep = OrderShipmentStep::where('id', $step->id)
                ->lockForUpdate()
                ->firstOrFail();
            
            $currentStep->update([
                'is_reached' => true,
                'reached_at' => $reachedAt ?? now(),
            ]);
        });
    }

    /**
     * Bascule l'état "reached" d'une étape.
     */
    public static function toggleReached(OrderShipmentStep $step): void
    {
        DB::transaction(function () use ($step) {
            $currentStep = OrderShipmentStep::where('id', $step->id)
                ->lockForUpdate()
                ->firstOrFail();
            
            $currentStep->update([
                'is_reached' => !$currentStep->is_reached,
                'reached_at' => !$currentStep->is_reached ? now() : null,
            ]);
        });
    }

    /**
     * Supprime une étape.
     */
    public static function delete(OrderShipmentStep $step): void
    {
        DB::transaction(function () use ($step) {
            // On s'assure que le modèle est bien chargé avant suppression
            $step->delete();
        });
    }

    /**
     * Réordonne les étapes massivement.
     */
    public static function reorder(array $positions): void
    {
        DB::transaction(function () use ($positions) {
            foreach ($positions as $id => $position) {
                OrderShipmentStep::where('id', $id)->update(['position' => $position]);
            }
        });
    }
}