<?php

namespace App\Core\User\Dto;

final class PermissionDto
{
    /**
     * @param string[] $roles Liste des noms de rôles
     * @param string[] $permissions Liste des noms de permissions
     */
    public function __construct(
        public readonly array $roles = [],
        public readonly array $permissions = [],
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            roles: $data['roles'] ?? [],
            permissions: $data['permissions'] ?? [],
        );
    }
}