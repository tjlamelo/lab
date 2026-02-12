<?php

namespace App\Core\Ordering\Actions;

use App\Models\OrderShipmentStep;
use App\Core\Ordering\Dto\OrderShipmentStepDto;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

final class OrderShipmentStepAction
{
    /**
     * Crée une nouvelle étape de suivi pour une commande.
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
     * Marque une étape comme "atteinte" (Le colis est arrivé à ce point).
     * Gère automatiquement l'horodatage si non fourni.
     */
    public static function markAsReached(OrderShipmentStep $step, ?Carbon $reachedAt = null): void
    {
        DB::transaction(function () use ($step, $reachedAt) {
            $step->refresh()->lockForUpdate();
            
            $step->update([
                'is_reached' => true,
                'reached_at' => $reachedAt ?? now(),
            ]);
        });
    }

    /**
     * Met à jour les informations d'une étape (ex: changement de description ou de coordonnées).
     */
    public static function update(OrderShipmentStep $step, OrderShipmentStepDto $dto): void
    {
        DB::transaction(function () use ($step, $dto) {
            $step->refresh()->lockForUpdate();

            $step->update([
                'position'           => $dto->position,
                'location_name'      => $dto->locationName,
                'status_description' => $dto->statusDescription,
                'latitude'           => $dto->latitude,
                'longitude'          => $dto->longitude,
                'estimated_arrival'  => $dto->estimatedArrival,
            ]);
        });
    }

    /**
     * Supprime une étape et réorganise potentiellement les positions restantes.
     */
    public static function delete(OrderShipmentStep $step): void
    {
        DB::transaction(function () use ($step) {
            $step->delete();
        });
    }

    /**
     * Permet de réordonner les étapes (Drag & Drop en Front-end).
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