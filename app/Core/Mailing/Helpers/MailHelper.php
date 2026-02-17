<?php

namespace App\Core\Mailing\Helpers;

use App\Core\Mailing\Dto\MailDto;
use App\Core\Mailing\Dto\BulkMailDto;
use App\Core\Mailing\Services\MailService;
use App\Core\Mailing\Services\BulkMailService;
use App\Mail\WelcomeMail;
use App\Mail\OrderConfirmationMail;
use App\Mail\OrderShippedMail;
use App\Mail\PasswordResetMail;
use App\Models\User;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

final class MailHelper
{
    /**
     * Envoie un email de bienvenue
     */
    public static function sendWelcome(User $user): bool
    {
        return app(MailService::class)->sendMailable(
            $user->email,
            new WelcomeMail($user)
        );
    }

    /**
     * Envoie une confirmation de commande
     */
    public static function sendOrderConfirmation(Order $order): bool
    {
        if (!$order->user || !$order->user->email) {
            return false;
        }

        return app(MailService::class)->sendMailable(
            $order->user->email,
            new OrderConfirmationMail($order)
        );
    }

    /**
     * Envoie une notification d'expédition
     */
    public static function sendOrderShipped(Order $order): bool
    {
        if (!$order->user || !$order->user->email) {
            return false;
        }

        return app(MailService::class)->sendMailable(
            $order->user->email,
            new OrderShippedMail($order)
        );
    }

    /**
     * Envoie un email de réinitialisation de mot de passe
     */
    public static function sendPasswordReset(string $email, string $resetUrl, int $expirationMinutes = 60): bool
    {
        return app(MailService::class)->sendMailable(
            $email,
            new PasswordResetMail($email, $resetUrl, $expirationMinutes)
        );
    }

    /**
     * Envoie un email personnalisé avec template
     */
    public static function sendCustom(
        string $to,
        string $subject,
        string $template,
        array $data = [],
        ?string $from = null,
        ?string $fromName = null
    ): bool {
        $dto = new MailDto(
            to: $to,
            subject: $subject,
            template: $template,
            data: $data,
            from: $from,
            fromName: $fromName,
        );

        return app(MailService::class)->send($dto);
    }

    /**
     * Envoie un email en queue
     */
    public static function queueCustom(
        string $to,
        string $subject,
        string $template,
        array $data = [],
        ?string $queue = 'emails'
    ): bool {
        $dto = new MailDto(
            to: $to,
            subject: $subject,
            template: $template,
            data: $data,
        );

        return app(MailService::class)->queue($dto, $queue);
    }

    /**
     * Envoie des emails en masse
     */
    public static function sendBulk(
        array $recipients,
        string $subject,
        string $template,
        array $commonData = [],
        array $personalizedData = []
    ): array {
        $dto = new BulkMailDto(
            recipients: $recipients,
            subject: $subject,
            template: $template,
            commonData: $commonData,
            personalizedData: $personalizedData,
        );

        return app(BulkMailService::class)->sendBulk($dto);
    }

    /**
     * Récupère les emails de tous les utilisateurs ayant un rôle admin/manager.
     */
    public static function adminAndManagerEmails(): array
    {
        try {
            return User::role(['admin', 'manager'])
                ->whereNotNull('email')
                ->pluck('email')
                ->unique()
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::error('MailHelper::adminAndManagerEmails failed', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Notifie tous les admins / managers avec un email simple (template par défaut).
     */
    public static function notifyAdminsAndManagers(string $subject, array $content): void
    {
        $recipients = self::adminAndManagerEmails();
        if (count($recipients) === 0) {
            return;
        }

        $dto = new BulkMailDto(
            recipients: $recipients,
            subject: $subject,
            template: 'templates.default',
            commonData: [
                'title' => $subject,
                'content' => $content,
            ],
        );

        // Utilise la queue pour supporter la montée en charge
        app(BulkMailService::class)->queueBulk($dto);
    }
}
