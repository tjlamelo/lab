<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'instructions',
        'slug',
        'logo',
        'is_active'
    ];

    protected $casts = [
        'name' => 'array',
        'instructions' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Une méthode de paiement est liée à plusieurs commandes
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}