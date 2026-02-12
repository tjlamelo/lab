<?php

namespace App\Core\User\Services;

use App\Models\UserDevice;
use App\Core\User\Actions\UserDeviceAction;
use App\Core\User\Dto\UserDeviceDto;
use Illuminate\Database\Eloquent\Collection;

final class UserDeviceService
{
    /**
     * Enregistre l'activité d'un appareil.
     * Utilise l'action atomique pour garantir l'intégrité du tracking.
     */
    public function logSession(UserDeviceDto $dto): UserDevice
    {
        return UserDeviceAction::track($dto);
    }

    /**
     * Récupère la liste de tous les appareils d'un utilisateur.
     */
    public function findAllByUser(int $userId): Collection
    {
        return UserDevice::where('user_id', $userId)
            ->latest('last_active_at')
            ->get();
    }

    /**
     * Valide un appareil spécifique (passage en mode trusted).
     */
    public function verifyDevice(int $deviceId): void
    {
        $device = UserDevice::findOrFail($deviceId);
        UserDeviceAction::trust($device);
    }

    /**
     * Supprime un appareil (déconnexion).
     */
    public function terminateSession(int $deviceId): void
    {
        $device = UserDevice::findOrFail($deviceId);
        UserDeviceAction::remove($device);
    }

    /**
     * Récupère uniquement les appareils qui nécessitent une attention (non trusted).
     */
    public function getSuspiciousDevices(int $userId): Collection
    {
        return UserDeviceAction::getUntrustedDevices($userId);
    }

    /**
     * Vérifie si l'empreinte actuelle est déjà validée pour cet utilisateur.
     */
    public function isCurrentDeviceSecure(int $userId, string $fingerprint): bool
    {
        return UserDevice::where('user_id', $userId)
            ->where('fingerprint', $fingerprint)
            ->where('is_trusted', true)
            ->exists();
    }
}