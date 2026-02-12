<?php

namespace App\Core\User\Actions;

use App\Models\UserDevice;
use App\Core\User\Dto\UserDeviceDto;
use Illuminate\Support\Facades\DB;

final class UserDeviceAction
{
    /**
     * Enregistre ou met à jour un appareil lors d'une connexion.
     */
    public static function track(UserDeviceDto $dto): UserDevice
    {
        return DB::transaction(function () use ($dto) {
            // Utilise l'index unique [user_id, fingerprint] pour trouver ou créer
            $device = UserDevice::updateOrCreate(
                [
                    'user_id'     => $dto->userId,
                    'fingerprint' => $dto->fingerprint,
                ],
                [
                    'device_type'    => $dto->deviceType,
                    'os_family'      => $dto->osFamily,
                    'browser_family' => $dto->browserFamily,
                    'last_ip'        => $dto->ipAddress,
                    'last_active_at' => now(),
                ]
            );

            // Si l'appareil existait déjà, on incrémente le compteur de connexions
            if (!$device->wasRecentlyCreated) {
                $device->increment('login_count');
            }

            return $device;
        });
    }

    /**
     * Marque un appareil comme "de confiance" (après un code OTP par exemple).
     */
    public static function trust(UserDevice $device): void
    {
        $device->update(['is_trusted' => true]);
    }

    /**
     * Supprime un appareil (déconnexion forcée de cet appareil).
     */
    public static function remove(UserDevice $device): void
    {
        $device->delete();
    }

    /**
     * Récupère tous les appareils suspects (non "trusted") pour un utilisateur.
     */
    public static function getUntrustedDevices(int $userId)
    {
        return UserDevice::where('user_id', $userId)
            ->where('is_trusted', false)
            ->get();
    }
}