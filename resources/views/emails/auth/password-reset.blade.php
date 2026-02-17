@extends('emails.layouts.base')

@section('content')
    @php
        /** @var \App\Models\MailSetting $mailSettings */
        $mailSettings = \App\Models\MailSetting::current();
        $brandPrimary = $mailSettings->brand_primary ?: '#5B21B6';
        $brandSecondary = $mailSettings->brand_secondary ?: '#7C3AED';
    @endphp
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td style="text-align: center; padding-bottom: 20px;">
                <h2 style="margin: 0; color: #212529; font-size: 24px; font-weight: 700; line-height: 1.3;">
                    {{ __('Reset Your Password') }}
                </h2>
            </td>
        </tr>
        <tr>
            <td style="padding-bottom: 20px;">
                <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {{ __('Hello,') }}
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding-bottom: 30px;">
                <p style="margin: 0 0 15px; color: #495057; font-size: 16px; line-height: 1.6;">
                    {{ __('We received a request to reset your password for your account associated with :email.', ['email' => $email]) }}
                </p>
                <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {{ __('Click the button below to reset your password. This link will expire in :minutes minutes.', ['minutes' => $expirationMinutes]) }}
                </p>
            </td>
        </tr>
        
        <!-- Warning Box -->
        <tr>
            <td style="padding-bottom: 30px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                    <tr>
                        <td style="padding: 20px;">
                            <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                                <strong>{{ __('Important:') }}</strong> {{ __('If you did not request a password reset, please ignore this email. Your password will remain unchanged.') }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <!-- Action Button -->
        <tr>
            <td style="text-align: center; padding-bottom: 20px;">
                <a href="{{ $resetUrl }}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, {{ $brandPrimary }} 0%, {{ $brandSecondary }} 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">
                    {{ __('Reset Password') }}
                </a>
            </td>
        </tr>
        
        <!-- Alternative Link -->
        <tr>
            <td style="padding-bottom: 30px;">
                <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                    {{ __('Or copy and paste this link into your browser:') }}
                </p>
                <p style="margin: 10px 0 0; color: {{ $brandPrimary }}; font-size: 12px; word-break: break-all; text-align: center;">
                    {{ $resetUrl }}
                </p>
            </td>
        </tr>
        
        <tr>
            <td style="padding-top: 30px; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                    {{ __('This password reset link will expire in :minutes minutes. For security reasons, please do not share this link with anyone.', ['minutes' => $expirationMinutes]) }}
                </p>
            </td>
        </tr>
    </table>
@endsection
