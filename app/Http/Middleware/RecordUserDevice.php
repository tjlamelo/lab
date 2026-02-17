<?php

namespace App\Http\Middleware;

use App\Core\Security\Services\UserDeviceService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class RecordUserDevice
{
    public function __construct(
        protected UserDeviceService $service
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $fingerprint = $this->service->getOrCreateFingerprint($request);

        /** @var Response $response */
        $response = $next($request);

        // S'assure que le navigateur conserve un fingerprint stable
        if (!$request->hasCookie(UserDeviceService::FINGERPRINT_COOKIE)) {
            $response->headers->setCookie(cookie(
                name: UserDeviceService::FINGERPRINT_COOKIE,
                value: $fingerprint,
                minutes: 60 * 24 * 365 * 5, // 5 ans
                path: '/',
                secure: $request->isSecure(),
                httpOnly: false,
                sameSite: 'Lax',
            ));
        }

        // Enregistre le device uniquement si l'utilisateur est authentifié
        $user = $request->user();
        if ($user) {
            $this->service->recordForUser($request, $user, $fingerprint);
        }

        return $response;
    }
}

