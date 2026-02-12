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
    ) {
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'category_id', 'sort_by', 'sort_order', 'per_page']);
        $filters['is_active'] = true;

        return Inertia::render('shop/explore/index', [
            'categories' => $this->categoryService->getActiveCategories(),
            'products' => $this->productService->search($filters),
            'filters' => $filters
        ]);
    }

    /**
     * API de suggestions intelligentes
     */
    public function suggestions(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = $request->get('query');
        $locale = app()->getLocale();

        if (strlen($query) < 1) {
            return response()->json([]);
        }

        $products = $this->productService->search([
            'search' => $query,
            'is_active' => true,
            'per_page' => 8
        ]);

        // On formate pour ne pas envoyer d'objets de traduction complexes au front
        // ExploreController.php -> suggestions()
        $formatted = collect($products->items())->map(function ($p) use ($locale) {
            return [
                'id' => $p->id,
                'slug' => $p->slug,
                'price' => $p->price,
                'formatted_price' => '$' . number_format($p->price, 2), // Prix forcé en USD
                'name' => $p->getTranslation('name', $locale),
                'category' => $p->category?->getTranslation('name', $locale),
                'image' => $p->images[0] ?? null,
                'unit' => $p->unit, // Crucial pour le choix de quantité
            ];
        });

        return response()->json($formatted);
    }

    public function show(string $identifier): Response
    {
        $product = $this->productService->findBySlugOrId($identifier);

        return Inertia::render('shop/explore/show-product', [
            'product' => $product
        ]);
    }
}