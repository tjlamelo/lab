<?php

namespace App\Core\Catalog\Dto;

final class ProductDto
{
    public function __construct(
        public readonly int|string $category_id,
        public readonly array $name,
        public readonly ?array $description,
        public readonly ?string $unit, // Changé en ?string uniquement
        public readonly ?array $meta,
        public readonly string $slug,
        public readonly ?string $sku,
        public readonly float $price,
        public readonly int $stock,
        public readonly ?array $images,
        public readonly ?string $purity,
        public readonly bool $is_active = true,
        public readonly bool $is_featured = false,
    ) {}

public static function fromRequest(array $data): self
{
    $purity = $data['purity'] ?? '99.9%';
    // Si la pureté est fournie mais sans le symbole %, on l'ajoute
    if (!empty($purity) && !str_contains($purity, '%')) {
        $purity .= '%';
    }

    return new self(
        category_id: $data['category_id'],
        name: $data['name'],
        description: $data['description'] ?? null,
        unit: (string) ($data['unit'] ?? 'g'), 
        meta: $data['meta'] ?? null,
        slug: $data['slug'] ?? '',
        sku: $data['sku'] ?? null,
        price: (float) $data['price'],
        stock: (int) $data['stock'],
        images: $data['images'] ?? [],
        purity: $purity, // Valeur nettoyée ici
        is_active: (bool) ($data['is_active'] ?? true),
        is_featured: (bool) ($data['is_featured'] ?? false),
    );
}
}