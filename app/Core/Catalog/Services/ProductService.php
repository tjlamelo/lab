<?php

namespace App\Core\Catalog\Services;

use App\Models\Product;
use App\Core\Catalog\Dto\ProductDto;
use App\Core\Catalog\Actions\ProductAction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

final class ProductService
{
    // On injecte l'instance de l'Action ici
    public function __construct(
        private readonly ProductAction $action
    ) {
    }

    public function createProduct(ProductDto $dto): Product
    {
        // ✅ Utilise -> au lieu de ::
        return $this->action->create($dto);
    }

    public function updateProduct(Product $product, ProductDto $dto): Product
    {
        // ✅ Utilise -> au lieu de ::
        return $this->action->update($product, $dto);
    }
    // --- RECHERCHE ET FILTRES DYNAMIQUE SELON LA LANGUE ---
/**
     * Liste les produits avec pagination et relations
     * * @param int $perPage Nombre d'éléments par page
     * @param array $filters Filtres optionnels (statut, catégorie, etc.)
     */
    public function getPaginatedProducts(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Product::query()
            ->with('category') // Eager loading pour la performance
            ->latest();        // Trie par défaut du plus récent au plus ancien

        // On n'affiche que les actifs par défaut, sauf si spécifié
        if (!isset($filters['include_inactive'])) {
            $query->where('is_active', true);
        }

        // Filtre rapide par catégorie si présent
        $query->when($filters['category_id'] ?? null, function ($q, $categoryId) {
            $q->where('category_id', $categoryId);
        });

        // Exécution de la pagination
        return $query->paginate($perPage);
    }
public function search(array $filters): LengthAwarePaginator
    {
        $query = Product::query();
        $locale = app()->getLocale();

        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];

            $query->where(function (Builder $q) use ($searchTerm, $locale) {
                // 1. Recherche dans le nom (Langue active - Priorité Max)
                $q->where("name->{$locale}", 'like', "%{$searchTerm}%")
                    // 2. Recherche dans la description (Langue active)
                    ->orWhere("description->{$locale}", 'like', "%{$searchTerm}%")
                    // 3. Recherche globale (SKU, Slug)
                    ->orWhere('sku', 'like', "%{$searchTerm}%")
                    ->orWhere('slug', 'like', "%{$searchTerm}%")
                    // 4. Recherche dans la catégorie
                    ->orWhereHas('category', function ($cat) use ($searchTerm, $locale) {
                        $cat->where("name->{$locale}", 'like', "%{$searchTerm}%")
                           ->orWhere('name', 'like', "%{$searchTerm}%");
                    });
            });

            // TRI INTELLIGENT : On fait remonter ce qui commence par le terme dans la langue du client
            $query->orderByRaw("CASE 
                WHEN name->'$.{$locale}' LIKE '{$searchTerm}%' THEN 1 
                WHEN name->'$.{$locale}' LIKE '%{$searchTerm}%' THEN 2 
                ELSE 3 
            END");
        }

        // Autres filtres
        $query->when($filters['category_id'] ?? null, fn($q, $id) => $q->where('category_id', $id));
        $query->when(isset($filters['is_active']), fn($q) => $q->where('is_active', $filters['is_active']));
        $query->when(isset($filters['is_featured']), fn($q) => $q->where('is_featured', $filters['is_featured']));

        // Si pas de recherche, tri par date
        if (empty($filters['search'])) {
            $sortField = $filters['sort_by'] ?? 'created_at';
            $sortOrder = $filters['sort_order'] ?? 'desc';
            $query->orderBy($sortField, $sortOrder);
        }

        return $query->with('category')->paginate($filters['per_page'] ?? 15);
    }

    /**
 * Récupère un produit par son Slug ou son ID avec ses relations
 */
public function findBySlugOrId(string|int $identifier): Product
{
    return Product::query()
        ->with(['category']) // Charge la catégorie pour afficher le badge sur la page Show
        ->where('is_active', true) // Sécurité : on ne veut pas qu'un client voie un produit désactivé via l'URL
        ->where(function (Builder $q) use ($identifier) {
            $q->where('slug', $identifier)
              ->orWhere('id', $identifier);
        })
        ->firstOrFail(); // Renvoie une 404 si le produit n'existe pas ou est inactif
}


    // --- APPELS VERS L'ACTION ---

    public function toggleProductStatus(Product $product, string $type): bool
    {
        return match ($type) {
            'active' => $this->action->toggleActive($product),
            'featured' => $this->action->toggleFeatured($product),
            default => false
        };
    }

    public function softDeleteProduct(Product $product): bool
    {
        return $this->action->delete($product);
    }

    public function restoreProduct(int $id): bool
    {
        return $this->action->restore($id);
    }

    public function permanentlyDeleteProduct(int $id): bool
    {
        return $this->action->forceDelete($id);
    }


}