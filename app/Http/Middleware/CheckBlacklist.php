<?php

namespace App\Http\Middleware;

use App\Core\Security\Services\BlacklistService;
use App\Core\Security\Services\UserDeviceService;
use App\Models\Blacklist;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class CheckBlacklist
{
    public function __construct(
        protected BlacklistService $service
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        // Option: ne pas bloquer les admins (pour pouvoir gérer la blacklist)
        try {
            $user = $request->user();
            if ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) {
                return $next($request);
            }
        } catch (\Throwable) {
            // ignore
        }

        $checks = [];

        // IP
        $ip = $request->ip();
        if ($ip) {
            $checks[] = ['type' => Blacklist::TYPE_IP, 'identifier' => $ip];
        }

        // Fingerprint cookie
        $fp = $request->cookie(UserDeviceService::FINGERPRINT_COOKIE);
        if (is_string($fp) && trim($fp) !== '') {
            $checks[] = ['type' => Blacklist::TYPE_FINGERPRINT, 'identifier' => trim($fp)];
        }

        // Email / phone (input ou user connecté)
        // Supporte plusieurs noms de champ (ex: login/username) pour bloquer dès la tentative de connexion.
        $email = $request->input('email')
            ?: $request->input('username')
            ?: $request->input('login')
            ?: $request->input('identifier')
            ?: $request->user()?->email;
        if (is_string($email) && trim($email) !== '') {
            $checks[] = ['type' => Blacklist::TYPE_EMAIL, 'identifier' => mb_strtolower(trim($email))];
        }

        $phone = $request->input('phone')
            ?: $request->input('tel')
            ?: $request->input('telephone')
            ?: $request->user()?->phone;
        if (is_string($phone) && trim($phone) !== '') {
            $checks[] = ['type' => Blacklist::TYPE_PHONE, 'identifier' => trim($phone)];
        }

        if ($this->service->isBlocked($checks)) {
            abort(403, __('Access denied.'));
        }

        return $next($request);
    }
}
