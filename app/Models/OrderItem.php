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
        'product_name_at_purchase'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'product_name_at_purchase' => 'array',
    ];

    /**
     * Relation vers la commande
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Relation vers le produit actuel
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}