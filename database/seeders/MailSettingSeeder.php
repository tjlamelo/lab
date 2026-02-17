<?php

namespace Database\Seeders;

use App\Models\MailSetting;
use Illuminate\Database\Seeder;

class MailSettingSeeder extends Seeder
{
    public function run(): void
    {
        // 1 seule ligne de settings (branding global)
        $settings = MailSetting::query()->first() ?? new MailSetting();

        $settings->fill([
            'company_name' => config('app.name', 'PrimeLab'),
            'website_url' => config('app.url', 'http://127.0.0.1:8000'),
            'support_email' => config('mail.from.address', 'support@primelabchemicals.com'),

            // Couleurs (inline dans les templates)
            'brand_primary' => '#5B21B6',
            'brand_secondary' => '#7C3AED',
            'background_color' => '#F4F4F4',

            // Chemin public (sera converti en URL absolue dans le Blade)
            'logo_path' => 'img/logo.png',

            'footer_note' => 'This is an automated email, please do not reply.',
        ]);

        $settings->save();
        MailSetting::flushCache();
    }
}

