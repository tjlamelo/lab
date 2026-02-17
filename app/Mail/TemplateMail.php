<?php

namespace App\Mail;

use App\Core\Mailing\Dto\MailDto;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\View;

class TemplateMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        protected MailDto $dto
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $envelope = new Envelope(subject: $this->dto->subject);

        // From: par défaut vient de config/mail.php (donc .env MAIL_FROM_*)
        // mais peut être surchargé via le DTO.
        $fromAddress = $this->dto->from ?: config('mail.from.address');
        $fromName = $this->dto->fromName ?: config('mail.from.name');

        if ($fromAddress) {
            $envelope->from(new Address($fromAddress, $fromName));
        }

        if ($this->dto->replyTo) {
            $envelope->replyTo(new Address($this->dto->replyTo));
        }

        return $envelope;
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $template = $this->dto->template;

        // Support both "orders.confirmation" (emails.orders.confirmation)
        // and "default" (emails.templates.default), etc.
        $candidates = [
            "emails.{$template}",
            "emails.templates.{$template}",
        ];

        $view = collect($candidates)->first(fn ($v) => View::exists($v)) ?? 'emails.templates.default';

        return new Content(
            view: $view,
            with: $this->dto->data,
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return $this->dto->attachments;
    }
}
