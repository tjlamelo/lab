<?php

namespace App\Core\Security\Actions;

use App\Models\UserDevice;
use Illuminate\Support\Facades\DB;

final class UserDeviceAction
{
    public static function upsertDevice(int $userId, string $fingerprint, array $data): UserDevice
    {
        return DB::transaction(function () use ($userId, $fingerprint, $data) {
            /** @var UserDevice $device */
            $device = UserDevice::query()->firstOrNew([
                'user_id' => $userId,
                'fingerprint' => $fingerprint,
            ]);

            if (!$device->exists) {
                $device->login_count = 1;
                $device->is_trusted = false;
            }

            $device->fill($data);
            $device->save();

            return $device->fresh();
        });
    }

    public static function toggleTrusted(UserDevice $device): void
    {
        DB::transaction(function () use ($device) {
            $device->update(['is_trusted' => !$device->is_trusted]);
        });
    }

    public static function delete(UserDevice $device): void
    {
        DB::transaction(function () use ($device) {
            $device->delete();
        });
    }
}

