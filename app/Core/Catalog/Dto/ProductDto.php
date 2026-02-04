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
        public readonly array $image_files = [], // Array de UploadedFile
        public readonly array $existing_images = [], // Chemins déjà en base (pour conservation)
        public readonly ?string $purity,
        public readonly bool $is_active = true,
        public readonly bool $is_featured = false,
    ) {
    }

public static function fromRequest(array $data): self
{
    $purity = $data['purity'] ?? '99.9%';
    if (!empty($purity) && !str_contains($purity, '%')) {
        $purity .= '%';
    }

    // --- CORRECTION ICI ---
    $existingImages = $data['existing_images'] ?? [];

    // Si le front-end a envoyé un JSON string (via JSON.stringify dans React)
    if (is_string($existingImages)) {
        $decoded = json_decode($existingImages, true);
        // On ne garde que si c'est un tableau valide, sinon on garde l'original ou vide
        $existingImages = is_array($decoded) ? $decoded : ($existingImages ? [$existingImages] : []);
    }
    // -----------------------

    return new self(
        category_id: $data['category_id'],
        name: $data['name'],
        description: $data['description'] ?? null,
        unit: (string) ($data['unit'] ?? 'g'), 
 // Au lieu de $data['meta'], on regarde ce qu'il y a vraiment dans la requête globale
meta: request()->input('meta') ?? $data['meta'] ?? null,
        slug: $data['slug'] ?? '',
        sku: $data['sku'] ?? null,
        price: (float) $data['price'],
        stock: (int) $data['stock'],
        image_files: request()->file('images') ?? [], 
        existing_images: $existingImages, // Utilise la variable traitée
        purity: $purity,
        is_active: (bool) ($data['is_active'] ?? true),
        is_featured: (bool) ($data['is_featured'] ?? false),
    );
}
}