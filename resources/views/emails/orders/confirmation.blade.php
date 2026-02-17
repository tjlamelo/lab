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
                    {{ __('Order Confirmed') }}
                </div>
            </td>
        </tr>
        <tr>
            <td style="text-align: center; padding-bottom: 20px;">
                <h2 style="margin: 0; color: #212529; font-size: 24px; font-weight: 700; line-height: 1.3;">
                    {{ __('Order Confirmed!') }}
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
                    {{ __('Thank you for your order! We have received your order and it is being processed.') }}
                </p>
                <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {{ __('Order Number:') }} <strong style="color: #212529;">#{{ $order->order_number }}</strong>
                </p>
            </td>
        </tr>
        
        <!-- Order Summary -->
        <tr>
            <td style="padding-bottom: 30px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 6px; overflow: hidden;">
                    <tr>
                        <td style="padding: 18px 20px; background: linear-gradient(135deg, {{ $brandPrimary }} 0%, {{ $brandSecondary }} 100%);">
                            <h3 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                                {{ __('Order Summary') }}
                            </h3>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                @foreach($order->items as $item)
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="color: #212529; font-size: 14px; font-weight: 600;">
                                                    {{ is_array($item->product_name) ? ($item->product_name[app()->getLocale()] ?? $item->product_name['en'] ?? 'Product') : $item->product_name }}
                                                </td>
                                                <td style="text-align: right; color: #495057; font-size: 14px;">
                                                    x{{ $item->quantity }}
                                                </td>
                                                <td style="text-align: right; color: #212529; font-size: 14px; font-weight: 600; padding-left: 15px;">
                                                    ${{ number_format($item->price * $item->quantity, 2) }}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                @endforeach
                                <tr>
                                    <td style="padding-top: 15px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="text-align: right; padding-top: 10px; border-top: 2px solid {{ $brandPrimary }};">
                                                    <p style="margin: 0; color: #212529; font-size: 18px; font-weight: 700;">
                                                        {{ __('Total:') }} ${{ number_format($order->total_amount, 2) }}
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
            </td>
        </tr>
        
        <!-- Shipping Address -->
        @if($order->shipping_address)
        <tr>
            <td style="padding-bottom: 30px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 6px;">
                    <tr>
                        <td style="padding: 20px;">
                            <p style="margin: 0 0 10px; color: #212529; font-size: 14px; font-weight: 600;">
                                {{ __('Shipping Address:') }}
                            </p>
                            <p style="margin: 0; color: #495057; font-size: 14px; line-height: 1.6;">
                                @if(isset($order->shipping_address['first_name']) || isset($order->shipping_address['last_name']))
                                    {{ ($order->shipping_address['first_name'] ?? '') . ' ' . ($order->shipping_address['last_name'] ?? '') }}<br>
                                @endif
                                @if(isset($order->shipping_address['street']))
                                    {{ $order->shipping_address['street'] }}<br>
                                @endif
                                @if(isset($order->shipping_address['city']))
                                    {{ $order->shipping_address['city'] }}
                                @endif
                                @if(isset($order->shipping_address['country']))
                                    {{ $order->shipping_address['country'] }}
                                @endif
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        @endif
        
        <!-- Action Buttons -->
        <tr>
            <td style="text-align: center; padding-bottom: 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                    <tr>
                        <td style="padding: 0 10px;">
                            <a href="{{ $trackingUrl }}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                {{ __('Track Order') }}
                            </a>
                        </td>
                        <td style="padding: 0 10px;">
                            <a href="{{ $appUrl }}/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #6c757d; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                {{ __('View Orders') }}
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <tr>
            <td style="padding-top: 30px; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                    {{ __('We will send you another email when your order ships. If you have any questions, please contact our support team.') }}
                </p>
            </td>
        </tr>
    </table>
@endsection
