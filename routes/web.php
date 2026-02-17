<?php

use App\Http\Controllers\Admin\Catalog\CategoryController;
use App\Http\Controllers\Admin\Catalog\ProductController;
use App\Http\Controllers\Admin\Order\AdminOrderController;
use App\Http\Controllers\Admin\Order\OrderShipmentStepController;
use App\Http\Controllers\Admin\Other\SocialNetworkController;
use App\Http\Controllers\Admin\Pricing\PaymentMethodController;
use App\Http\Controllers\Admin\User\UserController;
use App\Http\Controllers\Admin\User\UserDeviceController;
use App\Http\Controllers\Admin\Security\BlacklistController;
use App\Http\Controllers\Ordering\OrderController;
use App\Http\Controllers\Shop\CartController;
use App\Http\Controllers\Shop\ExploreController;
use App\Http\Controllers\Shop\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// === Route Standalone (Changement de langue) ===
// Doit être en dehors du groupe de localisation pour fonctionner correctement.
Route::post('/change-language', function () {
    $locale = request('locale');

    if (array_key_exists($locale, LaravelLocalization::getSupportedLocales())) {
        session(['locale' => $locale]);
        app()->setLocale($locale);

        $previousUrl = url()->previous();
        $redirectUrl = LaravelLocalization::getLocalizedURL($locale, $previousUrl);

        return redirect($redirectUrl);
    }
    return back();
})->name('change_language');


// === Groupe de Routes Localisées ===
// Toutes les routes publiques et accessibles à l'utilisateur connecté.
Route::group([
    'prefix' => LaravelLocalization::setLocale(),
    'middleware' => ['localeSessionRedirect', 'localizationRedirect', 'localeViewPath']
], function () {

    // === Routes Publiques de la Boutique ===
    Route::get('/', [HomeController::class, 'index'])->name('shop.home');

    // === Suivi de commande public ===
    Route::prefix('track-order')->name('public.order-tracking.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Public\OrderTrackingController::class, 'index'])->name('index');
        Route::post('/search', [\App\Http\Controllers\Public\OrderTrackingController::class, 'search'])->name('search');
        Route::get('/{orderNumber}', [\App\Http\Controllers\Public\OrderTrackingController::class, 'show'])->name('show');
    });

    // Groupe pour le catalogue (Produits & Catégories)
    Route::prefix('catalog')->group(function () {
        Route::resource('products', ProductController::class);
        // Actions spécifiques pour les produits
        Route::post('products/{product}/toggle', [ProductController::class, 'toggleStatus'])->name('products.toggle');
        Route::post('products/{id}/restore', [ProductController::class, 'restore'])->name('products.restore');
        Route::delete('products/{id}/force-delete', [ProductController::class, 'forceDelete'])->name('products.force-delete');

        Route::resource('categories', CategoryController::class)->names('categories');
        // Action spécifique pour les catégories
        Route::post('categories/{category}/toggle', [CategoryController::class, 'toggle'])->name('categories.toggle');
    });

    // Groupe pour l'exploration (page de découverte)
    Route::prefix('explore')->name('shop.')->group(function () {
        Route::get('/', [ExploreController::class, 'index'])->name('index');
        Route::get('/suggestions', [ExploreController::class, 'suggestions'])->name('suggestions');
        Route::get('/{identifier}', [ExploreController::class, 'show'])->name('product.show');
    });

    // Groupe pour le Panier (accessible invité ou connecté)
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('index');
        Route::post('/add', [CartController::class, 'store'])->name('store');
        Route::patch('/update/{productId}', [CartController::class, 'update'])->name('update');
        Route::delete('/remove/{productId}', [CartController::class, 'destroy'])->name('destroy');
        Route::delete('/clear', [CartController::class, 'clear'])->name('clear');
    });

    // === Routes Nécessitant une Authentification et une Vérification Email ===
    Route::middleware(['auth', 'verified'])->group(function () {

        // Groupe pour les Commandes Client (checkout et création de commande)
        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('/checkout', [OrderController::class, 'checkout'])->name('checkout');
            Route::post('/', [OrderController::class, 'store'])->name('store');
        });

        // === Zone d'administration sécurisée (rôles: admin, manager, editor) ===
        Route::middleware(['role:admin|manager|editor'])->group(function () {

            // Dashboard (admin stats)
            Route::get('dashboard', [\App\Http\Controllers\Admin\SystemDashboardController::class, 'index'])
                ->name('dashboard');

            // === Routes du Panneau d'Administration ===
            // Toutes les routes d'administration sont regroupées ici.
            Route::prefix('admin')->name('admin.')->group(function () {

                // Gestion des Utilisateurs
                Route::prefix('users')->name('users.')->group(function () {
                    Route::get('/', [UserController::class, 'index'])->name('index');
                    Route::get('/{id}/edit', [UserController::class, 'edit'])->name('edit');
                    Route::put('/{id}/access', [UserController::class, 'updateAccess'])->name('update.access');
                    Route::patch('/{id}/toggle', [UserController::class, 'toggleStatus'])->name('toggle');
                    Route::delete('/{id}', [UserController::class, 'destroy'])->name('destroy');

                    // Devices liés à l'utilisateur
                    Route::get('/{id}/devices', [UserDeviceController::class, 'index'])->name('devices.index');
                    Route::patch('/devices/{deviceId}/toggle-trusted', [UserDeviceController::class, 'toggleTrusted'])->name('devices.toggle-trusted');
                    Route::delete('/devices/{deviceId}', [UserDeviceController::class, 'destroy'])->name('devices.destroy');
                });

                // Gestion des Commandes (côté admin)
                Route::prefix('orders')->name('orders.')->group(function () {
                    Route::get('/', [AdminOrderController::class, 'index'])->name('index');
                    Route::get('/{id}', [AdminOrderController::class, 'show'])->name('show');
                    Route::post('/{id}/confirm-payment', [AdminOrderController::class, 'confirmPayment'])->name('confirm-payment');
                    Route::patch('/{id}/status', [AdminOrderController::class, 'updateStatus'])->name('update-status');
                    Route::patch('/{id}/payment-status', [AdminOrderController::class, 'updatePaymentStatus'])->name('update-payment-status');
                });

                // Gestion des Réseaux Sociaux
                Route::prefix('social-networks')->name('socials.')->group(function () {
                    Route::get('/', [SocialNetworkController::class, 'index'])->name('index');
                    Route::post('/', [SocialNetworkController::class, 'store'])->name('store');
                    Route::put('/{id}', [SocialNetworkController::class, 'update'])->name('update');
                    Route::delete('/{id}', [SocialNetworkController::class, 'destroy'])->name('destroy');
                    Route::patch('/{id}/toggle', [SocialNetworkController::class, 'toggle'])->name('toggle');
                    Route::patch('/reorder', [SocialNetworkController::class, 'reorder'])->name('reorder');
                });

                // Gestion des moyens de paiement
                Route::prefix('payment-methods')->name('payment-methods.')->group(function () {
                    Route::get('/', [PaymentMethodController::class, 'index'])->name('index');
                    Route::get('/{id}', [PaymentMethodController::class, 'show'])->name('show');
                    Route::post('/', [PaymentMethodController::class, 'store'])->name('store');
                    Route::put('/{id}', [PaymentMethodController::class, 'update'])->name('update');
                    Route::patch('/{id}/toggle', [PaymentMethodController::class, 'toggle'])->name('toggle');
                    Route::delete('/{id}', [PaymentMethodController::class, 'destroy'])->name('destroy');
                });

                // Gestion des Emails
                Route::prefix('mail')->name('mail.')->group(function () {
                    Route::get('/', [\App\Http\Controllers\Admin\Mail\MailManagementController::class, 'index'])->name('index');
                    Route::get('/create', [\App\Http\Controllers\Admin\Mail\MailManagementController::class, 'create'])->name('create');
                    Route::get('/settings', [\App\Http\Controllers\Admin\Mail\MailManagementController::class, 'settings'])->name('settings');
                    Route::put('/settings', [\App\Http\Controllers\Admin\Mail\MailManagementController::class, 'updateSettings'])->name('settings.update');
                    Route::post('/send-test', [\App\Http\Controllers\Admin\Mail\MailManagementController::class, 'sendTest'])->name('send-test');
                    Route::post('/send-custom', [\App\Http\Controllers\Admin\Mail\MailManagementController::class, 'sendCustom'])->name('send-custom');
                    Route::get('/bulk-create', [\App\Http\Controllers\Admin\Mail\MailManagementController::class, 'bulkCreate'])->name('bulk-create');
                    Route::post('/send-bulk', [\App\Http\Controllers\Admin\Mail\MailManagementController::class, 'sendBulk'])->name('send-bulk');
                });

                // Sécurité: Blacklist
                Route::prefix('security')->name('security.')->group(function () {
                    Route::prefix('blacklist')->name('blacklist.')->group(function () {
                        Route::get('/', [BlacklistController::class, 'index'])->name('index');
                        Route::post('/', [BlacklistController::class, 'store'])->name('store');
                        Route::post('/block-user/{user}', [BlacklistController::class, 'blockUser'])->name('block-user');
                        Route::delete('/{id}', [BlacklistController::class, 'destroy'])->name('destroy');
                    });
                });
            });

            // Suivi des étapes de livraison (admin)
            Route::prefix('admin/orders/{order}/tracking')->name('admin.orders.tracking.')->group(function () {
                Route::get('/', [OrderShipmentStepController::class, 'index'])->name('index');
                Route::post('/initialize', [OrderShipmentStepController::class, 'store'])->name('initialize');
                Route::post('/advance', [OrderShipmentStepController::class, 'advance'])->name('advance');
                Route::put('/steps/{step}', [OrderShipmentStepController::class, 'update'])->name('update');
                Route::patch('/steps/{step}/toggle', [OrderShipmentStepController::class, 'toggle'])->name('toggle');
                Route::delete('/steps/{step}', [OrderShipmentStepController::class, 'destroy'])->name('destroy');
            });
        });
    });



});


// === Route d'Accueil / Authentification ===
// Route pour la page de bienvenue, souvent utilisée comme page d'accueil avant login.
// Route::get('/auth', function () {
//     return Inertia::render('shop/home', [
//         'canRegister' => Features::enabled(Features::registration()),
//     ]);
// })->name('home');


// === Fichiers de configuration externes ===
// Inclusion des routes de Fortify, Jetstream, etc.
require __DIR__ . '/settings.php';
