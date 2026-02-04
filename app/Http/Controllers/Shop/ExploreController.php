<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Core\Catalog\Services\CategoryService;
use App\Core\Catalog\Services\ProductService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExploreController extends Controller
{
    public function __construct(
        private readonly CategoryService $categoryService,
        private readonly ProductService $productService
    ) {}

    /**
     * Affiche la page de recherche/catalogue (L'index)
     */
    public function index(Request $request): Response
    {
        // 1. On récupère les filtres depuis la requête
        $filters = $request->only(['search', 'category_id', 'sort_by', 'sort_order', 'per_page']);
        
        // Sécurité : Uniquement les produits actifs
        $filters['is_active'] = true;

        return Inertia::render('shop/explore/index', [
            'categories' => $this->categoryService->getActiveCategories(),
            'products'   => $this->productService->search($filters),
            'filters'    => $filters
        ]);
    }

    /**
     * Affiche le détail d'un produit (La page Show)
     * On accepte l'ID ou le Slug
     */
    public function show(string $identifier): Response
    {
        // Utilisation de la méthode robuste du service
        $product = $this->productService->findBySlugOrId($identifier);
        
        return Inertia::render('shop/explore/show-product', [
            'product' => $product
        ]);
    }
}