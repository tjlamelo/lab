<?php

namespace App\Core\Pricing\Dto;

final class PaymentMethodDto
{
    public function __construct(
        public readonly int $id,
        public readonly string $name, // Changé de array à string
        public readonly string $slug,
        public readonly ?array $instructions = null, // Reste array pour le multilingue
        public readonly ?array $paymentDetails = null, // Nouveau champ ajouté
        public readonly ?string $logo = null,
        public readonly bool $isActive = true,
    ) {}

    /**
     * Crée un DTO à partir d'un modèle Eloquent ou d'un tableau
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            name: $data['name'], 
            slug: $data['slug'],
            instructions: $data['instructions'] ?? null,
            paymentDetails: $data['payment_details'] ?? null,
            logo: $data['logo'] ?? null,
            isActive: (bool) ($data['is_active'] ?? true),
        );
    }
}