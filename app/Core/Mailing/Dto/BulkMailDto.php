<?php

namespace App\Core\Mailing\Dto;

final class BulkMailDto
{
    /**
     * @param string[] $recipients Liste des emails destinataires
     * @param array<string, array> $personalizedData Données personnalisées par email [email => data]
     */
    public function __construct(
        public readonly array $recipients,
        public readonly string $subject,
        public readonly string $template,
        public readonly array $commonData = [],
        public readonly array $personalizedData = [],
        public readonly ?string $from = null,
        public readonly ?string $fromName = null,
        public readonly int $batchSize = 50,
        public readonly int $delayBetweenBatches = 0, // en secondes
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            recipients: $data['recipients'],
            subject: $data['subject'],
            template: $data['template'],
            commonData: $data['common_data'] ?? $data['commonData'] ?? [],
            personalizedData: $data['personalized_data'] ?? $data['personalizedData'] ?? [],
            from: $data['from'] ?? null,
            fromName: $data['from_name'] ?? $data['fromName'] ?? null,
            batchSize: $data['batch_size'] ?? $data['batchSize'] ?? 50,
            delayBetweenBatches: $data['delay_between_batches'] ?? $data['delayBetweenBatches'] ?? 0,
        );
    }
}
