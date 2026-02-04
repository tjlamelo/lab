<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialNetwork extends Model
{
    protected $fillable = ['platform', 'url', 'order', 'is_active'];

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