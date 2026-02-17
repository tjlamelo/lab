<?php

namespace App\Core\Mailing\Actions;

use App\Core\Mailing\Dto\MailDto;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

final class MailAction
{
    /**
     * Envoie un email immédiatement
     */
    public function send(MailDto $dto): bool
    {
        try {
            $mail = Mail::to($dto->to);

            // CC
            if (!empty($dto->cc)) {
                $mail->cc($dto->cc);
            }

            // BCC
            if (!empty($dto->bcc)) {
                $mail->bcc($dto->bcc);
            }

            // Envoyer avec le template
            $mail->send(new \App\Mail\TemplateMail($dto));

            return true;
        } catch (\Exception $e) {
            Log::error('MailAction::send failed', [
                'dto' => $dto->toArray(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Met un email en queue
     */
    public function queue(MailDto $dto, ?string $queue = 'emails'): bool
    {
        try {
            $mail = Mail::to($dto->to);

            if (!empty($dto->cc)) {
                $mail->cc($dto->cc);
            }

            if (!empty($dto->bcc)) {
                $mail->bcc($dto->bcc);
            }

            $mail->queue(new \App\Mail\TemplateMail($dto), $queue);

            return true;
        } catch (\Exception $e) {
            Log::error('MailAction::queue failed', [
                'dto' => $dto->toArray(),
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Programme un email pour plus tard
     */
    public function later(MailDto $dto, \DateTimeInterface $when, ?string $queue = 'emails'): bool
    {
        try {
            $mail = Mail::to($dto->to);

            if (!empty($dto->cc)) {
                $mail->cc($dto->cc);
            }

            if (!empty($dto->bcc)) {
                $mail->bcc($dto->bcc);
            }

            $mail->later($when, new \App\Mail\TemplateMail($dto), $queue);

            return true;
        } catch (\Exception $e) {
            Log::error('MailAction::later failed', [
                'dto' => $dto->toArray(),
                'when' => $when->format('Y-m-d H:i:s'),
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
