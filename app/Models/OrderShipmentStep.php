<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderShipmentStep extends Model
{
    protected $fillable = [
        'order_id', 
        'position', 
        'location_name', 
        'status_description',
        'latitude', 
        'longitude', 
        'is_reached', 
        'reached_at', 
        'estimated_arrival'
    ];

    protected $casts = [
        // Casts supprimés pour location_name et status_description (string par défaut)
        'is_reached' => 'boolean',
        'reached_at' => 'datetime',
        'estimated_arrival' => 'datetime',
    ];

    /**
     * Relation vers la commande parente
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}