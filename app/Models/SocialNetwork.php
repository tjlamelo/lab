<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SocialNetwork extends Model
{
    protected $fillable = ['platform', 'url', 'order', 'is_active'];

    /**
     * Cache key for public (active) social links used on the front-end.
     */
    public const CACHE_KEY_PUBLIC = 'settings_social_networks';

    /**
     * Get active social networks for public display (cached).
     *
     * @return array<int, array{platform: string, url: string, order: int}>
     */
    public static function getPublicList(): array
    {
        return Cache::remember(self::CACHE_KEY_PUBLIC, 3600, function () {
            return self::where('is_active', true)
                ->orderBy('order')
                ->get(['platform', 'url', 'order'])
                ->map(fn ($s) => [
                    'platform' => $s->platform,
                    'url' => $s->formatted_url,
                    'order' => $s->order,
                ])
                ->values()
                ->all();
        });
    }

    /**
     * Retourne l'icône correspondante (ex: pour FontAwesome ou Lucide)
     */
    public function getIconAttribute(): string
    {
        return match($this->platform) {
            'facebook'  => 'fab fa-facebook',
            'telegram'  => 'fab fa-telegram',
            'whatsapp'  => 'fab fa-whatsapp',
            'x'         => 'fab fa-x-twitter',
            'instagram' => 'fab fa-instagram',
            'linkedin'  => 'fab fa-linkedin',
            default     => 'fas fa-link',
        };
    }

    /**
     * Formate l'URL pour WhatsApp si nécessaire
     */
    public function getFormattedUrlAttribute(): string
    {
        if ($this->platform === 'whatsapp') {
            // Nettoie le numéro pour ne garder que les chiffres
            $phone = preg_replace('/[^0-9]/', '', $this->url);
            return "https://wa.me/{$phone}";
        }

        return $this->url;
    }
}