<?php

namespace App\Core\User\Actions;

use App\Models\BlackList;
use App\Core\User\Dto\BlackListDto;
use Illuminate\Support\Facades\DB;

final class BlackListAction
{
    /**
     * Ajoute un identifiant à la liste noire en base de données.
     */
    public static function block(BlackListDto $dto): BlackList
    {
        return DB::transaction(function () use ($dto) {
            // On utilise updateOrCreate pour éviter les doublons d'identifiants
            return BlackList::updateOrCreate(
                [
                    'identifier' => $dto->identifier, 
                    'type'       => $dto->type
                ],
                [
                    'reason'     => $dto->reason,
                    'metadata'   => $dto->metadata,
                    'expires_at' => $dto->expiresAt,
                ]
            );
        });
    }

    /**
     * Vérifie directement en BD si l'identifiant est banni et non expiré.
     */
    public static function isBlocked(string $identifier): bool
    {
        return BlackList::where('identifier', $identifier)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    /**
     * Supprime définitivement un bannissement de la base de données.
     */
    public static function unblock(string $identifier): void
    {
        BlackList::where('identifier', $identifier)->delete();
    }

    /**
     * Nettoie la table des bannissements expirés pour libérer de l'espace.
     */
    public static function cleanupExpired(): int
    {
        return BlackList::whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->delete();
    }
}