<?php

namespace App\Http\Middleware;

use App\Models\SocialNetwork;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $locale = app()->getLocale();
        $cartService = app(\App\Core\Ordering\Services\CartCacheService::class);
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'cart' => [
                // Compte le panier pour l'utilisateur connecté ou l'invité (session)
                'count' => $cartService->getCart(
                    $request->user()?->id ?? $request->session()->getId()
                )['count'],
            ],
            'locale' => app()->getLocale(),
            'translations' => $this->getTranslations($locale),
            'supported_locales' => \Mcamara\LaravelLocalization\Facades\LaravelLocalization::getSupportedLocales(),
            'sidebarOpen' => !$request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'socialNetworks' => SocialNetwork::getPublicList(),
        ];

    }
    /**
     * Charge le contenu du fichier JSON de langue
     */
    protected function getTranslations($locale)
    {
        $path = lang_path("$locale.json");

        if (file_exists($path)) {
            return json_decode(file_get_contents($path), true);
        }

        return [];
    }
}
