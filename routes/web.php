<?php

use App\Http\Controllers\Admin\Catalog\CategoryController;
use App\Http\Controllers\Admin\Catalog\ProductController;
use App\Http\Controllers\Shop\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;
use App\Http\Controllers\Shop\ExploreController;


Route::post('/change-language', function () {
    $locale = request('locale');

    if (array_key_exists($locale, LaravelLocalization::getSupportedLocales())) {
        session(['locale' => $locale]);
        app()->setLocale($locale);

        // On récupère l'URL précédente
        $previousUrl = url()->previous();

        // On génère l'URL localisée correspondante
        $redirectUrl = LaravelLocalization::getLocalizedURL($locale, $previousUrl);

        return redirect($redirectUrl);
    }
    return back();
})->name('change_language');



Route::group([
    'prefix' => LaravelLocalization::setLocale(),
    'middleware' => ['localeSessionRedirect', 'localizationRedirect', 'localeViewPath']
], function () {


    Route::get('/home', [HomeController::class, 'index'])->name('shop.home');

    Route::group(['prefix' => 'catalog'], function () {

        // Resource standard (index, create, store, show, edit, update, destroy)
        Route::resource('products', ProductController::class);

        // Routes spécifiques (Toggle & Soft Deletes)
        Route::post('products/{product}/toggle', [ProductController::class, 'toggleStatus'])
            ->name('products.toggle');

        Route::post('products/{id}/restore', [ProductController::class, 'restore'])
            ->name('products.restore');

        Route::delete('products/{id}/force-delete', [ProductController::class, 'forceDelete'])
            ->name('products.force-delete');



        Route::resource('categories', CategoryController::class)->names([
            'index' => 'categories.index',
            'create' => 'categories.create',
            'store' => 'categories.store',
                'show' => 'categories.show',
                 
            'edit' => 'categories.edit',
            'update' => 'categories.update',
            'destroy' => 'categories.destroy',
        ]);
        Route::post('categories/{category}/toggle', [CategoryController::class, 'toggle'])
    ->name('categories.toggle');
    });

Route::prefix('explore')->name('shop.')->group(function () {
    
    // Page d'accueil du catalogue (ex: /explore)
    Route::get('/', [ExploreController::class, 'index'])->name('index');
    
    // Page de détail du produit (ex: /explore/nom-du-produit)
    // Note : On utilise {identifier} pour accepter slug ou ID
    Route::get('/{identifier}', [ExploreController::class, 'show'])->name('product.show');

});
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->middleware(['auth', 'verified'])->name('dashboard');

});


Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');


require __DIR__ . '/settings.php';
