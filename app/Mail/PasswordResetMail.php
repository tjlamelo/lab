<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $email,
        public string $resetUrl,
        public int $expirationMinutes = 60
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('Reset Your Password'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.auth.password-reset',
            with: [
                'email' => $this->email,
                'resetUrl' => $this->resetUrl,
                'expirationMinutes' => $this->expirationMinutes,
                'appName' => config('app.name'),
                'appUrl' => config('app.url'),
            ],
        );
    }
}
