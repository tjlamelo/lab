<?php

namespace App\Http\Controllers\Admin\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Catalog\ProductRequest;
use App\Http\Resources\Admin\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Core\Catalog\Services\ProductService;
use App\Core\Catalog\Dto\ProductDto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService
    ) {}

    /**
     * Liste et Recherche (Vue Principale)
     */
public function index(Request $request): Response
{
    $filters = $request->only([
        'search', 'category_id', 'is_active', 
        'is_featured', 'sort_by', 'sort_order', 'per_page', 'trashed'
    ]);

    // On récupère les données via le service
    $products = $this->productService->search($filters);

    return Inertia::render('admin/catalog/index', [
        // On transforme les données paginées via le Resource
        'products' => ProductResource::collection($products),
        'filters'  => $filters,
    ]);
}
    /**
     * Formulaire de création
     */
 public function create(): Response
    {
        return Inertia::render('admin/catalog/create', [
            'categories' => Category::orderBy('name->en')->get(['id', 'name'])
        ]);
    }

    /**
     * Enregistrement du produit
     */
    public function store(ProductRequest $request): RedirectResponse
{
    // $request->validated() contient uniquement les données filtrées par tes règles
    $this->productService->createProduct(ProductDto::fromRequest($request->validated()));

    return redirect()->route('products.index')
        ->with('success', __('Product created successfully.'));
}

    /**
     * Détails d'un produit
     */
public function show(Product $product): Response
{
{
    // On charge la catégorie ici impérativement
    return Inertia::render('admin/catalog/show', [
        'product' => new ProductResource($product->load('category'))
    ]);
}
}

    /**
     * Formulaire d'édition
     */
    public function edit(Product $product): Response
    {
        return Inertia::render('admin/catalog/edit', [
            'product' => $product,
            'categories' => Category::orderBy('name->en')->get(['id', 'name'])
        ]);
    }

    /**
     * Mise à jour du produit
     */
 public function update(ProductRequest $request, Product $product): RedirectResponse
{
    $this->productService->updateProduct(
        $product, 
        ProductDto::fromRequest($request->validated())
    );

    return back()->with('success', __('Product updated successfully.'));
}

    /**
     * Toggle status (Active / Featured)
     */
    public function toggleStatus(Request $request, Product $product): RedirectResponse
    {
        $type = $request->get('type'); // 'active' ou 'featured'
        $this->productService->toggleProductStatus($product, $type);

        return back()->with('success', "Le statut $type a été modifié.");
    }

    /**
     * Soft Delete (Corbeille)
     */
    public function destroy(Product $product): RedirectResponse
    {
        $this->productService->softDeleteProduct($product);

        return redirect()->route('products.index')
            ->with('success', 'Produit déplacé dans la corbeille.');
    }

    /**
     * Restaurer un produit supprimé
     */
    public function restore(int $id): RedirectResponse
    {
        $this->productService->restoreProduct($id);

        return back()->with('success', 'Produit restauré avec succès.');
    }

    /**
     * Suppression définitive
     */
    public function forceDelete(int $id): RedirectResponse
    {
        $this->productService->permanentlyDeleteProduct($id);

        return back()->with('success', 'Produit supprimé définitivement.');
    }
}