<?php

namespace App\Core\Ordering\Dto;

use Carbon\Carbon;

final class OrderShipmentStepDto
{
    public function __construct(
        public readonly int $id,
        public readonly int $orderId,
        public readonly int $position,
        public readonly array $locationName,
        public readonly ?array $statusDescription = null,
        public readonly ?float $latitude = null,
        public readonly ?float $longitude = null,
        public readonly bool $isReached = false,
        public readonly ?Carbon $reachedAt = null,
        public readonly ?Carbon $estimatedArrival = null,
    ) {}

    /**
     * Crée un DTO à partir des données de la base de données
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            orderId: $data['order_id'],
            position: (int) $data['position'],
            locationName: is_string($data['location_name']) 
                ? json_decode($data['location_name'], true) 
                : $data['location_name'],
            statusDescription: isset($data['status_description']) 
                ? (is_string($data['status_description']) ? json_decode($data['status_description'], true) : $data['status_description']) 
                : null,
            latitude: isset($data['latitude']) ? (float) $data['latitude'] : null,
            longitude: isset($data['longitude']) ? (float) $data['longitude'] : null,
            isReached: (bool) ($data['is_reached'] ?? false),
            reachedAt: isset($data['reached_at']) ? Carbon::parse($data['reached_at']) : null,
            estimatedArrival: isset($data['estimated_arrival']) ? Carbon::parse($data['estimated_arrival']) : null,
        );
    }
}