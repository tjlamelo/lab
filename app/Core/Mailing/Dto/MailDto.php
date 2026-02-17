<?php

namespace App\Core\Mailing\Dto;

final class MailDto
{
    public function __construct(
        public readonly string $to,
        public readonly string $subject,
        public readonly string $template,
        public readonly array $data = [],
        public readonly ?string $from = null,
        public readonly ?string $fromName = null,
        public readonly array $cc = [],
        public readonly array $bcc = [],
        public readonly array $attachments = [],
        public readonly ?string $replyTo = null,
        public readonly int $priority = 3, // 1 = highest, 5 = lowest
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            to: $data['to'],
            subject: $data['subject'],
            template: $data['template'],
            data: $data['data'] ?? [],
            from: $data['from'] ?? null,
            fromName: $data['from_name'] ?? $data['fromName'] ?? null,
            cc: $data['cc'] ?? [],
            bcc: $data['bcc'] ?? [],
            attachments: $data['attachments'] ?? [],
            replyTo: $data['reply_to'] ?? $data['replyTo'] ?? null,
            priority: $data['priority'] ?? 3,
        );
    }

    public function toArray(): array
    {
        return [
            'to' => $this->to,
            'subject' => $this->subject,
            'template' => $this->template,
            'data' => $this->data,
            'from' => $this->from,
            'from_name' => $this->fromName,
            'cc' => $this->cc,
            'bcc' => $this->bcc,
            'attachments' => $this->attachments,
            'reply_to' => $this->replyTo,
            'priority' => $this->priority,
        ];
    }
}
