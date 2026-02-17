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
            <td style="padding-bottom: 20px;">
                <h2 style="margin: 0; color: #212529; font-size: 24px; font-weight: 700; line-height: 1.3;">
                    {{ $title ?? __('Hello') }}
                </h2>
            </td>
        </tr>
        <tr>
            <td style="padding-bottom: 30px;">
                @if(isset($content))
                    @if(is_array($content))
                        @foreach($content as $paragraph)
                            <p style="margin: 0 0 15px; color: #495057; font-size: 16px; line-height: 1.6;">
                                {{ $paragraph }}
                            </p>
                        @endforeach
                    @else
                        <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
                            {!! $content !!}
                        </p>
                    @endif
                @else
                    <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
                        {{ __('This is a default email template.') }}
                    </p>
                @endif
            </td>
        </tr>
        @if(isset($buttonText) && isset($buttonUrl))
        <tr>
            <td style="text-align: center; padding-bottom: 20px;">
                <a href="{{ $buttonUrl }}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, {{ $brandPrimary }} 0%, {{ $brandSecondary }} 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">
                    {{ $buttonText }}
                </a>
            </td>
        </tr>
        @endif
    </table>
@endsection
