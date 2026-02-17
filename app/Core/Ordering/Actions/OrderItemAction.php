<?php

namespace App\Core\Ordering\Actions;

use App\Models\OrderShipmentStep;
use App\Core\Ordering\Dto\OrderShipmentStepDto;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

final class OrderShipmentStepAction
{
    /**
     * Crée une nouvelle étape dans le parcours.
     * Utilise une transaction pour assurer la sécurité.
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
                'reached_at'         => $dto->isReached ? ($dto->reachedAt ?? now()) : null,
                'estimated_arrival'  => $dto->estimatedArrival,
            ]);
        });
    }

    /**
     * Met à jour une étape existante de manière sécurisée.
     */
public static function update(int $id, OrderShipmentStepDto $dto): void
{
    DB::transaction(function () use ($id, $dto) {
        // CORRECT : On récupère et on verrouille en une seule fois
        $step = OrderShipmentStep::where('id', $id)
            ->lockForUpdate()
            ->firstOrFail();

        $step->update([
            'position'           => $dto->position,
            'location_name'      => $dto->locationName,
            'status_description' => $dto->statusDescription,
            'latitude'           => $dto->latitude,
            'longitude'          => $dto->longitude,
            'estimated_arrival'  => $dto->estimatedArrival,
            'is_reached'         => $dto->isReached,
        ]);
    });
}

    /**
     * Valide le passage du colis à un point précis.
     */
    public static function markAsReached(int $id, ?Carbon $reachedAt = null): void
    {
        DB::transaction(function () use ($id, $reachedAt) {
            $step = OrderShipmentStep::findOrFail($id);
            
            $step->update([
                'is_reached' => true,
                'reached_at' => $reachedAt ?? now(),
            ]);
        });
    }

    /**
     * Supprime une étape et réorganise les positions restantes 
     * pour éviter les trous dans la séquence (1, 2, 4 -> 1, 2, 3).
     */
    public static function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $step = OrderShipmentStep::findOrFail($id);
            $orderId = $step->order_id;

            $step->delete();

            // Réorganisation automatique
            $steps = OrderShipmentStep::where('order_id', $orderId)
                ->orderBy('position')
                ->get();

            foreach ($steps as $index => $s) {
                $s->update(['position' => $index + 1]);
            }
        });
    }

    /**
     * Permet de réorganiser massivement les étapes (Drag & Drop admin).
     * Format attendu : [id => position, id => position]
     */
    public static function reorder(array $newPositions): void
    {
        DB::transaction(function () use ($newPositions) {
            foreach ($newPositions as $id => $pos) {
                OrderShipmentStep::where('id', $id)->update(['position' => $pos]);
            }
        });
    }
}