<?php

namespace App\Models;

use App\Enums\OrderStatus; // Importation de l'Enum
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 
        'order_number', 
        'payment_method_id', 
        'payment_status', 
        'payment_proof', 
        'payment_verified_at', 
        'total_amount', 
        'status', 
        'shipping_address', 
        'notes'
    ];

    protected $casts = [
        // Cast vers l'Enum pour manipuler les statuts proprement
        'status' => OrderStatus::class,
        'payment_status' => PaymentStatus::class,
        // Cast array pour que React reçoive un objet {street, city, phone}
        'shipping_address' => 'array', 
        
        'payment_verified_at' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        
        // Génère un numéro de commande unique type CMD-2026-ABC12
        static::creating(function ($order) {
            // On s'assure que le statut par défaut est défini via l'Enum si vide
            if (!$order->status) {
                $order->status = OrderStatus::WAITING_PAYMENT;
            }
            
            $order->order_number = 'CMD-' . date('Y') . '-' . strtoupper(Str::random(6));
        });
    }

    /**
     * Relations
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shippingSteps(): HasMany
    {
        return $this->hasMany(OrderShipmentStep::class)->orderBy('position');
    }
}