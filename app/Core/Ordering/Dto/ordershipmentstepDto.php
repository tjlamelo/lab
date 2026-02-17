<?php

namespace App\Core\Ordering\Dto;

use DateTimeInterface;  
use Carbon\Carbon;

final class OrderShipmentStepDto
{
    public function __construct(
        public readonly int $id,
        public readonly int $orderId,
        public readonly int $position,
        public readonly string $locationName, // Changé en string
        public readonly ?string $statusDescription = null, // Changé en ?string
        public readonly ?float $latitude = null,
        public readonly ?float $longitude = null,
        public readonly bool $isReached = false,
        public readonly ?DateTimeInterface $reachedAt = null,
        public readonly ?DateTimeInterface $estimatedArrival = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id: (int) ($data['id'] ?? 0),
            orderId: (int) $data['order_id'],
            position: (int) $data['position'],
            locationName: (string) ($data['location_name'] ?? ''),
            statusDescription: isset($data['status_description']) ? (string) $data['status_description'] : null,
            latitude: isset($data['latitude']) ? (float) $data['latitude'] : null,
            longitude: isset($data['longitude']) ? (float) $data['longitude'] : null,
            isReached: (bool) ($data['is_reached'] ?? false),
            reachedAt: isset($data['reached_at']) ? Carbon::parse($data['reached_at']) : null,
            estimatedArrival: isset($data['estimated_arrival']) ? Carbon::parse($data['estimated_arrival']) : null,
        );
    }
}