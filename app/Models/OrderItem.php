<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 
        'product_id', 
        'quantity', 
        'price',
        'unit_at_purchase', // Ajouté pour correspondre à la migration et au DTO
        'product_name_at_purchase'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'product_name_at_purchase' => 'json', // Utiliser 'json' est souvent plus précis que 'array' pour les DB modernes
    ];

    /**
     * Relation vers la commande parente.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Relation vers le produit original.
     * Note: On peut avoir un produit NULL si celui-ci a été supprimé du catalogue (set null).
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}