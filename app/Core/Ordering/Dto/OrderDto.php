<?php

namespace App\Core\Ordering\Dto;

final class OrderDto
{
    /**
     * @param OrderItemDto[] $items
     */
    public function __construct(
        public readonly int $userId,
        public readonly int $paymentMethodId,
        public readonly float $totalAmount,
        public readonly array $shippingAddress,
        public readonly array $items,
        public readonly ?string $notes = null,
        public readonly ?string $paymentProof = null,
    ) {}

 public static function fromRequest(int $userId, array $validatedData): self
{
    // On utilise collect() pour s'assurer que même si c'est une Collection, 
    // on peut itérer et transformer en array à la fin.
    $items = collect($validatedData['items'])->map(
        fn($item) => OrderItemDto::fromArray((array) $item)
    )->all();

    return new self(
        userId: $userId,
        paymentMethodId: $validatedData['payment_method_id'],
        totalAmount: (float) $validatedData['total_amount'],
        shippingAddress: $validatedData['shipping_address'],
        items: $items,
        notes: $validatedData['notes'] ?? null,
        paymentProof: $validatedData['payment_proof'] ?? null
        
    );
}
}