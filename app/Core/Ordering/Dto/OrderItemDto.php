<?php

namespace App\Core\Ordering\Dto;

final class OrderItemDto
{
    public function __construct(
        public readonly int $productId,
        public readonly int $quantity,
        public readonly float $price,
        public readonly ?array $productNameAtPurchase = null,
    ) {}

    /**
     * Crée un DTO à partir d'un tableau (utile pour les requêtes Request ou Session)
     */
    public static function fromArray(array $data): self
    {
        return new self(
            productId: $data['product_id'],
            quantity: $data['quantity'],
            price: (float) $data['price'],
            productNameAtPurchase: $data['product_name'] ?? null
        );
    }
}