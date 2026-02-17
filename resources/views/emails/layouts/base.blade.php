<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $subject ?? config('app.name') }}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
</head>
@php
    /** @var \App\Models\MailSetting $mailSettings */
    $mailSettings = \App\Models\MailSetting::current();

    $brandPrimary = $mailSettings->brand_primary ?: '#5B21B6';
    $brandSecondary = $mailSettings->brand_secondary ?: '#7C3AED';
    $backgroundColor = $mailSettings->background_color ?: '#F4F4F4';

    $companyName = $mailSettings->company_name ?: config('app.name');
    $websiteUrl = $mailSettings->website_url ?: config('app.url');
    $supportEmail = $mailSettings->support_email ?: config('mail.from.address');

    $logoPath = $mailSettings->logo_path ?: 'img/logo.png';
    // IMPORTANT: les clients email ont besoin d'une URL ABSOLUE pour les images
    // - si logo_path est déjà une URL (https://...), on la garde
    // - sinon on la préfixe avec app.url / websiteUrl
    $logoUrl = str_starts_with($logoPath, 'http://') || str_starts_with($logoPath, 'https://')
        ? $logoPath
        : rtrim($websiteUrl, '/') . '/' . ltrim($logoPath, '/');

    $footerNote = $mailSettings->footer_note ?: __('This is an automated email, please do not reply.');
@endphp
<body style="margin: 0; padding: 0; background-color: {{ $backgroundColor }}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: {{ $backgroundColor }};">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 28px 40px 22px; text-align: center; background: linear-gradient(135deg, {{ $brandPrimary }} 0%, {{ $brandSecondary }} 100%); border-radius: 8px 8px 0 0;">
                            <a href="{{ $websiteUrl }}" style="text-decoration: none; display: inline-block;">
                                <img src="{{ $logoUrl }}" alt="{{ $companyName }}" width="76" height="76" style="display:block; width:76px; height:76px; border-radius:14px; background-color:#ffffff; padding:10px; box-sizing:border-box;" />
                            </a>
                            <h1 style="margin: 14px 0 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.4px;">
                                {{ $companyName }}
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            @yield('content')
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 26px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef; border-radius: 0 0 8px 8px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; color: #6c757d; font-size: 14px; line-height: 1.6;">
                                        <p style="margin: 0 0 10px;">
                                            {{ $footerNote }}
                                        </p>
                                        @if($supportEmail)
                                            <p style="margin: 0 0 10px;">
                                                <a href="mailto:{{ $supportEmail }}" style="color: {{ $brandPrimary }}; text-decoration: none;">
                                                    {{ $supportEmail }}
                                                </a>
                                            </p>
                                        @endif
                                        <p style="margin: 0;">
                                            &copy; {{ date('Y') }} {{ $companyName }}. {{ __('All rights reserved.') }}
                                        </p>
                                        <p style="margin: 15px 0 0;">
                                            <a href="{{ $websiteUrl }}" style="color: {{ $brandPrimary }}; text-decoration: none;">{{ $websiteUrl }}</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
