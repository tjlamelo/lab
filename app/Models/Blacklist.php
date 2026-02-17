<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Blacklist extends Model
{
    // Types (alignés avec ta migration)
    public const TYPE_EMAIL = 1;
    public const TYPE_FINGERPRINT = 2;
    public const TYPE_IP = 3;
    public const TYPE_PHONE = 4;

    protected $fillable = [
        'identifier',
        'type',
        'reason',
        'metadata',
        'expires_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'expires_at' => 'datetime',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->whereNull('expires_at')
                ->orWhere('expires_at', '>', now());
        });
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public static function typeLabels(): array
    {
        return [
            self::TYPE_EMAIL => __('Email'),
            self::TYPE_FINGERPRINT => __('Fingerprint'),
            self::TYPE_IP => __('IP Address'),
            self::TYPE_PHONE => __('Phone'),
        ];
    }
}