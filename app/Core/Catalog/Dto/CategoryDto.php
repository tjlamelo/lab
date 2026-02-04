<?php

namespace App\Core\Catalog\Dto;
 

final class  CategoryDto
{
 public function __construct(
        public array $name,
        public string $slug,
        public ?array $description,
        public ?int $parentId,
        // Correction : Accepter UploadedFile, string ou null
        public mixed $image, 
        public bool $isActive,
    ) {}

    /**
     * Crée un DTO à partir des données brutes (ex: Request)
     */
public static function fromArray(array $data): self
{
    return new self(
        name: $data['name'],
        slug: $data['slug'] ?? '',
        description: $data['description'] ?? null,
        // Harmonisation des valeurs vides du Select
        parentId: (empty($data['parent_id']) || $data['parent_id'] === 'null' || $data['parent_id'] === 'none') 
            ? null 
            : (int)$data['parent_id'],
        image: $data['image'] ?? null,
        isActive: filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
    );
}
}