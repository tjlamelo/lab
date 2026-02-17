@extends('emails.layouts.base')

@section('content')
    @php
        // Rendre ce template utilisable aussi depuis l'admin (TemplateMail) sans data obligatoire
        $appName = $appName ?? config('app.name');
        $appUrl = $appUrl ?? config('app.url');
        $userName = isset($user) ? ($user->name ?? __('there')) : ($name ?? __('there'));
        $userEmail = isset($user) ? ($user->email ?? null) : ($email ?? null);
        $createdAt = (isset($user) && $user->created_at) ? $user->created_at->format('F d, Y') : null;

        /** @var \App\Models\MailSetting $mailSettings */
        $mailSettings = \App\Models\MailSetting::current();
        $brandPrimary = $mailSettings->brand_primary ?: '#5B21B6';
        $brandSecondary = $mailSettings->brand_secondary ?: '#7C3AED';
    @endphp

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td style="text-align: center; padding-bottom: 20px;">
                <h2 style="margin: 0; color: #212529; font-size: 24px; font-weight: 700; line-height: 1.3;">
                    {{ __('Welcome to :app!', ['app' => $appName]) }}
                </h2>
            </td>
        </tr>
        <tr>
            <td style="padding-bottom: 30px;">
                <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {{ __('Hello :name,', ['name' => $userName]) }}
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding-bottom: 30px;">
                <p style="margin: 0 0 15px; color: #495057; font-size: 16px; line-height: 1.6;">
                    {{ __('Thank you for joining us! We are excited to have you on board.') }}
                </p>
                <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {{ __('Your account has been successfully created. You can now start exploring our products and services.') }}
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding-bottom: 30px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td style="background-color: #f8f9fa; border-left: 4px solid {{ $brandPrimary }}; padding: 20px; border-radius: 6px;">
                            <p style="margin: 0 0 10px; color: #212529; font-size: 14px; font-weight: 600;">
                                {{ __('Your Account Details:') }}
                            </p>
                            @if($userEmail)
                                <p style="margin: 0 0 5px; color: #495057; font-size: 14px;">
                                    <strong>{{ __('Email:') }}</strong> {{ $userEmail }}
                                </p>
                            @endif
                            @if($createdAt)
                                <p style="margin: 0; color: #495057; font-size: 14px;">
                                    <strong>{{ __('Account Created:') }}</strong> {{ $createdAt }}
                                </p>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="text-align: center; padding-bottom: 20px;">
                <a href="{{ rtrim($appUrl, '/') }}/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, {{ $brandPrimary }} 0%, {{ $brandSecondary }} 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">
                    {{ __('Go to Dashboard') }}
                </a>
            </td>
        </tr>
        <tr>
            <td style="padding-top: 30px; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                    {{ __('If you have any questions, feel free to contact our support team. We are here to help!') }}
                </p>
            </td>
        </tr>
    </table>
@endsection
