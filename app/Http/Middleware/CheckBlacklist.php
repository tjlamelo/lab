<?php

namespace App\Http\Middleware;

use App\Models\Blacklist;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBlacklist
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    // app/Http/Middleware/CheckBlacklist.php
    public function handle(Request $request, Closure $next)
    {
        $visitorFingerprint = $request->header('X-Visitor-Fingerprint');
        $userEmail = $request->user()?->email;

        $isBanned = Blacklist::where('identifier', $visitorFingerprint)
            ->orWhere('identifier', $userEmail)
            ->exists();

        if ($isBanned) {
            // On retourne une page d'erreur ou on redirige vers Google
            abort(403, "Accès interdit.");
        }

        return $next($request);
    }
}
