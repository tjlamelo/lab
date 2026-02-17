<?php

namespace App\Core\Security\Services;

use App\Core\Security\Actions\UserDeviceAction;
use App\Models\User;
use App\Models\UserDevice;
use App\Core\Mailing\Services\MailService;
use App\Core\Mailing\Dto\MailDto;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

final class UserDeviceService
{
    public const FINGERPRINT_COOKIE = 'device_fingerprint';

    public function __construct(
        protected MailService $mailService,
    ) {}

    public function getOrCreateFingerprint(Request $request): string
    {
        $existing = $request->cookie(self::FINGERPRINT_COOKIE);
        if (is_string($existing) && trim($existing) !== '') {
            return $existing;
        }

        return (string) Str::uuid();
    }

    public function parseDeviceInfo(Request $request): array
    {
        $ua = strtolower((string) $request->userAgent());

        $deviceType = null;
        if (str_contains($ua, 'mobile') || str_contains($ua, 'android') || str_contains($ua, 'iphone')) {
            $deviceType = 'mobile';
        } elseif (str_contains($ua, 'ipad') || str_contains($ua, 'tablet')) {
            $deviceType = 'tablet';
        } else {
            $deviceType = 'desktop';
        }

        $os = null;
        if (str_contains($ua, 'windows')) $os = 'Windows';
        elseif (str_contains($ua, 'android')) $os = 'Android';
        elseif (str_contains($ua, 'iphone') || str_contains($ua, 'ipad') || str_contains($ua, 'ios')) $os = 'iOS';
        elseif (str_contains($ua, 'mac os') || str_contains($ua, 'macintosh')) $os = 'Mac';
        elseif (str_contains($ua, 'linux')) $os = 'Linux';

        $browser = null;
        if (str_contains($ua, 'edg/')) $browser = 'Edge';
        elseif (str_contains($ua, 'chrome')) $browser = 'Chrome';
        elseif (str_contains($ua, 'firefox')) $browser = 'Firefox';
        elseif (str_contains($ua, 'safari')) $browser = 'Safari';

        return [
            'device_type' => $deviceType,
            'os_family' => $os,
            'browser_family' => $browser,
            'last_ip' => $request->ip(),
            'last_active_at' => now(),
        ];
    }

    public function recordForUser(Request $request, User $user, string $fingerprint): UserDevice
    {
        $existing = UserDevice::query()
            ->where('user_id', $user->id)
            ->where('fingerprint', $fingerprint)
            ->first();

        if ($existing) {
            // IMPORTANT: on enregistre uniquement les nouveaux appareils
            // Donc si l'appareil existe déjà pour cet utilisateur, on ne met pas à jour la ligne.
            return $existing;
        }

        $info = $this->parseDeviceInfo($request);
        $device = UserDeviceAction::upsertDevice($user->id, $fingerprint, $info);

        // Notifier l'utilisateur de la connexion depuis un nouvel appareil (sécurité compte)
        try {
            if ($user->email) {
                $details = [];
                if ($device->device_type || $device->os_family || $device->browser_family) {
                    $details[] = __('Device') . ': ' . trim(implode(' / ', array_filter([
                        $device->device_type,
                        $device->os_family,
                        $device->browser_family,
                    ])));
                }
                if ($device->last_ip) {
                    $details[] = 'IP: ' . $device->last_ip;
                }

                $content = [
                    __('A new device has just been used to access your account on :app.', ['app' => config('app.name')]),
                ];
                if (!empty($details)) {
                    $content[] = implode(' | ', $details);
                }
                $content[] = __('If this was not you, we strongly recommend that you change your password and contact our support team immediately.');

                $dto = new MailDto(
                    to: $user->email,
                    subject: __('New device connected to your account'),
                    template: 'templates.default',
                    data: [
                        'title' => __('New device connected'),
                        'content' => $content,
                    ],
                );

                $this->mailService->queue($dto);
            }
        } catch (\Throwable) {
            // On ne casse jamais la navigation de l'utilisateur à cause d'un email de sécurité
        }

        return $device;
    }

    public function listByUser(int $userId)
    {
        return UserDevice::query()
            ->where('user_id', $userId)
            ->orderByDesc('last_active_at')
            ->get();
    }

    public function toggleTrusted(int $deviceId): void
    {
        $device = UserDevice::findOrFail($deviceId);
        UserDeviceAction::toggleTrusted($device);
    }

    public function delete(int $deviceId): void
    {
        $device = UserDevice::findOrFail($deviceId);
        UserDeviceAction::delete($device);
    }
}

