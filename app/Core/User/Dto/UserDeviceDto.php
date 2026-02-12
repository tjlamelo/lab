<?php

namespace App\Core\User\Dto;

final class UserDeviceDto
{
    public function __construct(
        public readonly int $userId,
        public readonly string $fingerprint,
        public readonly ?string $deviceType = null,
        public readonly ?string $osFamily = null,
        public readonly ?string $browserFamily = null,
        public readonly ?string $ipAddress = null,
    ) {}

    public static function fromRequest(int $userId, string $fingerprint, array $details, ?string $ip): self
    {
        return new self(
            userId: $userId,
            fingerprint: $fingerprint,
            deviceType: $details['device_type'] ?? null,
            osFamily: $details['os_family'] ?? null,
            browserFamily: $details['browser_family'] ?? null,
            ipAddress: $ip,
        );
    }
}