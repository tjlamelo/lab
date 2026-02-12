<?php
 
namespace App\Core\Ordering\Dto;

use JsonSerializable;

final class OrderItemDto implements JsonSerializable
{
    public function __construct(
        public readonly int $productId,
        public readonly int $quantity,
        public readonly float $price,
        public readonly ?string $unitAtPurchase = null,
        public readonly ?string $productNameAtPurchase = null,
        public readonly ?string $productImage = null, // AJOUT ICI
    ) {}

    public static function fromArray(array $data): self
    {
        \Illuminate\Support\Facades\Log::debug('Données brutes reçues par le DTO:', $data);
        return new self(
            // Mapping flexible : priorité au camelCase (interne/Redis) puis snake_case (Request)
            productId: $data['productId'] ?? $data['product_id'],
            quantity:  $data['quantity'],
            price:     (float) $data['price'],
            
            // Nouveau champ pour correspondre à ta migration
            unitAtPurchase: $data['unitAtPurchase'] ?? ($data['unit'] ?? null),
            
            productNameAtPurchase: $data['productNameAtPurchase'] ?? ($data['product_name'] ?? null),
            productImage: $data['productImage'] ?? ($data['product_image'] ?? null) // AJOUT ICI
        );
    }

    /**
     * Structure de sérialisation pour Redis ou les API internes
     */
    public function jsonSerialize(): array
    {
        return [
            'productId'             => $this->productId,
            'quantity'              => $this->quantity,
            'price'                 => $this->price,
            'unitAtPurchase'        => $this->unitAtPurchase,
            'productNameAtPurchase' => $this->productNameAtPurchase,
            'productImage' => $this->productImage, // AJOUT ICI
        ];
    }
}