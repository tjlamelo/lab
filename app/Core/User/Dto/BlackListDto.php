<?php

namespace App\Core\User\Dto;

final class BlackListDto
{
    public const TYPE_EMAIL = 1;
    public const TYPE_FINGERPRINT = 2;
    public const TYPE_IP = 3;
    public const TYPE_PHONE = 4;

    public function __construct(
        public readonly string $identifier,
        public readonly int $type,
        public readonly ?string $reason = null,
        public readonly ?array $metadata = null,
        public readonly ?\DateTimeInterface $expiresAt = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            identifier: $data['identifier'],
            type: (int) $data['type'],
            reason: $data['reason'] ?? null,
            metadata: $data['metadata'] ?? null,
            expiresAt: isset($data['expires_at']) ? new \DateTime($data['expires_at']) : null,
        );
    }
}