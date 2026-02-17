<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class MailSetting extends Model
{
    protected $table = 'mail_settings';

    protected $fillable = [
        'company_name',
        'website_url',
        'support_email',
        'brand_primary',
        'brand_secondary',
        'background_color',
        'logo_path',
        'footer_note',
    ];

    public static function current(): self
    {
        return Cache::remember('settings_mail_branding', now()->addMinutes(30), function () {
            /** @var self|null $existing */
            $existing = self::query()->first();

            if ($existing) {
                return $existing;
            }

            return self::query()->create([
                'company_name' => config('app.name'),
                'website_url' => config('app.url'),
                'support_email' => config('mail.from.address'),
                'brand_primary' => '#5B21B6',   // PrimeLab purple-ish
                'brand_secondary' => '#7C3AED', // secondary purple
                'background_color' => '#F4F4F4',
                'logo_path' => 'img/logo.png',
                'footer_note' => __('This is an automated email, please do not reply.'),
            ]);
        });
    }

    public static function flushCache(): void
    {
        Cache::forget('settings_mail_branding');
    }
}

