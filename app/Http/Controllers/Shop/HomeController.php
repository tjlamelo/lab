<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product; // Import du modèle
use App\Http\Resources\Admin\ProductResource; // Import du resource
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
public function index(): Response
{
    $featuredProducts = Product::where('is_active', true)
        ->where('is_featured', true)
        ->latest()
        ->take(5)
        ->get();

    // Analyse des données trouvées
    // dd($featuredProducts->toArray()); 

    return Inertia::render('shop/home', [
        'products' => ProductResource::collection($featuredProducts)
    ]);
}
}