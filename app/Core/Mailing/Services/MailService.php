<?php

namespace App\Core\Mailing\Services;

use App\Core\Mailing\Dto\MailDto;
use App\Core\Mailing\Actions\MailAction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Mailable;

final class MailService
{
    public function __construct(
        protected MailAction $mailAction
    ) {}

    /**
     * Envoie un email simple
     */
    public function send(MailDto $dto): bool
    {
        try {
            return $this->mailAction->send($dto);
        } catch (\Exception $e) {
            Log::error('Mail sending failed', [
                'to' => $dto->to,
                'subject' => $dto->subject,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Envoie un email via une classe Mailable
     */
    public function sendMailable(string $to, Mailable $mailable): bool
    {
        try {
            Mail::to($to)->send($mailable);
            return true;
        } catch (\Exception $e) {
            Log::error('Mailable sending failed', [
                'to' => $to,
                'mailable' => get_class($mailable),
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Envoie un email avec queue
     */
    public function queue(MailDto $dto, ?string $queue = 'emails'): bool
    {
        try {
            return $this->mailAction->queue($dto, $queue);
        } catch (\Exception $e) {
            Log::error('Mail queueing failed', [
                'to' => $dto->to,
                'subject' => $dto->subject,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Envoie un email plus tard
     */
    public function later(MailDto $dto, \DateTimeInterface $when, ?string $queue = 'emails'): bool
    {
        try {
            return $this->mailAction->later($dto, $when, $queue);
        } catch (\Exception $e) {
            Log::error('Mail scheduling failed', [
                'to' => $dto->to,
                'subject' => $dto->subject,
                'when' => $when->format('Y-m-d H:i:s'),
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
