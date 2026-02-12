<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case PENDING = 'pending';
    case WAITING_VERIFICATION = 'waiting_verification';
    case PAID = 'paid';
    case FAILED = 'failed';
    case REFUNDED = 'refunded';

    /**
     * Retourne le label traduit pour chaque statut.
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => __('Pending'),
            self::WAITING_VERIFICATION => __('Waiting verification'),
            self::PAID => __('Paid'),
            self::FAILED => __('Failed'),
            self::REFUNDED => __('Refunded'),
        };
    }

    /**
     * Formate les options pour les Selects dans Inertia/React.
     */
    public static function getOptions(): array
    {
        return array_map(fn($status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ], self::cases());
    }
}