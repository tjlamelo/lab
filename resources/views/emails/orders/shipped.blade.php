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
            <td style="text-align: center; padding-bottom: 30px;">
                <div style="display:inline-block; padding:10px 14px; border-radius:999px; background-color:#F3F4F6; border:1px solid #E5E7EB; color:#111827; font-size:13px; font-weight:700;">
                    {{ __('Shipped') }}
                </div>
            </td>
        </tr>
        <tr>
            <td style="text-align: center; padding-bottom: 20px;">
                <h2 style="margin: 0; color: #212529; font-size: 24px; font-weight: 700; line-height: 1.3;">
                    {{ __('Your Order Has Shipped!') }}
                </h2>
            </td>
        </tr>
        <tr>
            <td style="padding-bottom: 20px;">
                <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {{ __('Great news! Your order is on its way.') }}
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding-bottom: 30px;">
                <p style="margin: 0 0 15px; color: #495057; font-size: 16px; line-height: 1.6;">
                    {{ __('Order Number:') }} <strong style="color: #212529;">#{{ $order->order_number }}</strong>
                </p>
                <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {{ __('Your order has been shipped and is on its way to you. You can track its progress using the link below.') }}
                </p>
            </td>
        </tr>
        
        <!-- Tracking Info -->
        <tr>
            <td style="padding-bottom: 30px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-left: 4px solid {{ $brandPrimary }}; border-radius: 6px;">
                    <tr>
                        <td style="padding: 20px;">
                            <p style="margin: 0 0 10px; color: #212529; font-size: 14px; font-weight: 600;">
                                {{ __('Track Your Order') }}
                            </p>
                            <p style="margin: 0; color: #495057; font-size: 14px; line-height: 1.6;">
                                {{ __('Use the tracking link below to see real-time updates on your shipment.') }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <!-- Action Button -->
        <tr>
            <td style="text-align: center; padding-bottom: 20px;">
                <a href="{{ $trackingUrl }}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, {{ $brandPrimary }} 0%, {{ $brandSecondary }} 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">
                    {{ __('Track Your Order') }}
                </a>
            </td>
        </tr>
        
        <tr>
            <td style="padding-top: 30px; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                    {{ __('You will receive another notification when your order is delivered. If you have any questions, please contact our support team.') }}
                </p>
            </td>
        </tr>
    </table>
@endsection
