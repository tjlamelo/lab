<?php

namespace App\Enums;

enum OrderStatus: string
{
    case WAITING_PAYMENT = 'waiting_payment';
    case PROCESSING = 'processing';
    case SHIPPING = 'shipping';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';

    /**
     * Retourne le label traduit. 
     * Par défaut, Laravel cherchera ces clés dans lang/fr.json
     */
    public function label(): string
    {
        return match($this) {
            self::WAITING_PAYMENT => __('Waiting for payment'),
            self::PROCESSING      => __('Processing'),
            self::SHIPPING        => __('Shipping'),
            self::DELIVERED       => __('Delivered'),
            self::CANCELLED       => __('Cancelled'),
        };
    }

    public static function getOptions(): array
    {
        return array_map(fn($status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ], self::cases());
    }
}