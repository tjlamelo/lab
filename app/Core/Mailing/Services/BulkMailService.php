<?php

namespace App\Core\Mailing\Services;

use App\Core\Mailing\Dto\BulkMailDto;
use App\Core\Mailing\Dto\MailDto;
use App\Core\Mailing\Services\MailService;
use Illuminate\Support\Facades\Log;

final class BulkMailService
{
    public function __construct(
        protected MailService $mailService
    ) {}

    /**
     * Envoie des emails en masse avec personnalisation
     */
    public function sendBulk(BulkMailDto $dto): array
    {
        $results = [
            'sent' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        $batches = array_chunk($dto->recipients, $dto->batchSize);

        foreach ($batches as $batchIndex => $batch) {
            foreach ($batch as $email) {
                try {
                    // Fusionner les données communes avec les données personnalisées
                    $personalizedData = array_merge(
                        $dto->commonData,
                        $dto->personalizedData[$email] ?? []
                    );

                    $mailDto = new MailDto(
                        to: $email,
                        subject: $dto->subject,
                        template: $dto->template,
                        data: $personalizedData,
                        from: $dto->from,
                        fromName: $dto->fromName,
                    );

                    if ($this->mailService->send($mailDto)) {
                        $results['sent']++;
                    } else {
                        $results['failed']++;
                        $results['errors'][] = "Failed to send to: {$email}";
                    }
                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = "Error sending to {$email}: " . $e->getMessage();
                    Log::error('Bulk mail error', [
                        'email' => $email,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Délai entre les batches si configuré
            if ($dto->delayBetweenBatches > 0 && $batchIndex < count($batches) - 1) {
                sleep($dto->delayBetweenBatches);
            }
        }

        return $results;
    }

    /**
     * Envoie des emails en masse avec queue
     */
    public function queueBulk(BulkMailDto $dto, ?string $queue = 'emails'): void
    {
        foreach ($dto->recipients as $email) {
            try {
                $personalizedData = array_merge(
                    $dto->commonData,
                    $dto->personalizedData[$email] ?? []
                );

                $mailDto = new MailDto(
                    to: $email,
                    subject: $dto->subject,
                    template: $dto->template,
                    data: $personalizedData,
                    from: $dto->from,
                    fromName: $dto->fromName,
                );

                $this->mailService->queue($mailDto, $queue);
            } catch (\Exception $e) {
                Log::error('Bulk mail queue error', [
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
