<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blacklist extends Model
{
    protected $fillable = [
        'identifier',
        'type',
        'reason',
        'expires_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Vérifie si un identifiant donné est présent dans la liste noire
     */
    public static function isBanned(string $identifier): bool
    {
        return self::where('identifier', $identifier)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }
}