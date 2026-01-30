<?php

use App\Http\Controllers\Admin\Catalog\ProductController;
use App\Http\Controllers\Shop\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;


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
 