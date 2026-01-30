<?php

namespace App\Core\Catalog\Actions;

use App\Models\Product;
use App\Core\Catalog\Dto\ProductDto;
use App\Core\Catalog\Actions\ProductSeoGenerator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use Illuminate\Support\Facades\Log;

final class ProductAction
{
    public function __construct(
        private ProductSeoGenerator $seoGenerator
    ) {}

public function create(ProductDto $dto): Product
{
    return DB::transaction(function () use ($dto) {
        // 1. Gérer le slug unique
        $slug = $this->generateUniqueSlug($dto->slug ?: $dto->name['en'] ?? reset($dto->name));

        // 2. Création initiale
        $product = Product::create([
            'category_id' => $dto->category_id,
            'name'        => $dto->name,
            'description' => $dto->description,
            'unit'        => $dto->unit, // Ajouté ici
            'slug'        => $slug,
            'sku'         => $dto->sku ?? $this->generateSku($dto),
            'price'       => $dto->price,
            'purity'      => $dto->purity,
            'stock'       => $dto->stock,
            'images'      => $dto->images,
            'is_active'   => $dto->is_active,
            'is_featured' => $dto->is_featured,
        ]);

        // 3. Générer le SEO multilingue complet
        $product->update([
            'meta' => $this->seoGenerator->generate($product, $dto->meta)
        ]);

        return $product;
    });
}

public function update(Product $product, ProductDto $dto): Product
{
    return DB::transaction(function () use ($product, $dto) {
        // --- LOG META RECU ---
        Log::info('DEBUT UPDATE META PRODUIT ID: ' . $product->id, [
            'meta_dto_brut' => $dto->meta, // Ce qui vient du formulaire React
            'meta_actuel_db' => $product->meta, // Ce qui est en base actuellement
        ]);

        $slug = $product->slug;
        if ($dto->slug && $dto->slug !== $product->slug) {
            $slug = $this->generateUniqueSlug($dto->slug, $product->id);
        }

        // 1. Update des champs classiques
        $product->update([
            'category_id' => $dto->category_id,
            'name'        => $dto->name,
            'description' => $dto->description,
            'unit'        => $dto->unit,
            'slug'        => $slug,
            'sku'         => $dto->sku,
            'price'       => $dto->price,
            'stock'       => $dto->stock,
            'purity'      => $dto->purity,
            'images'      => $dto->images,
            'is_active'   => $dto->is_active,
            'is_featured' => $dto->is_featured,
        ]);

        // 2. Génération du SEO
        $newSeoMeta = $this->seoGenerator->generate($product, $dto->meta);

        // --- LOG TRANSFORMATION SEO ---
        Log::info('RESULTAT SEO GENERATOR ID: ' . $product->id, [
            'meta_genere' => $newSeoMeta
        ]);

        $product->update([
            'meta' => $newSeoMeta
        ]);

        $finalProduct = $product->fresh();

        // --- LOG FINAL ---
        Log::info('FIN UPDATE META ID: ' . $product->id, [
            'meta_final_db' => $finalProduct->meta
        ]);

        return $finalProduct;
    });
}

    /**
     * Génère un slug unique en vérifiant la base de données
     */
    private function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        while (Product::where('slug', $slug)
            ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
            ->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        return $slug;
    }

    /**
     * Génère un SKU automatique si manquant
     */
    private function generateSku(ProductDto $dto): string
    {
        return 'PRIME-' . strtoupper(Str::random(6));
    }

// --- GESTION DE L'ÉTAT ---

    public function toggleActive(Product $product): bool
    {
        return $product->update(['is_active' => !$product->is_active]);
    }

    public function toggleFeatured(Product $product): bool
    {
        return $product->update(['is_featured' => !$product->is_featured]);
    }

    public function updateStatus(Product $product, bool $status): bool
    {
        return $product->update(['is_active' => $status]);
    }

    // --- SUPPRESSIONS ---

    public function delete(Product $product): bool
    {
        // Soft Delete (automatique via Eloquent si le trait est présent sur le modèle)
        return $product->delete();
    }

    public function restore(int $id): bool
    {
        // Restauration d'un produit supprimé (Soft Delete)
        return Product::onlyTrashed()->findOrFail($id)->restore();
    }

    public function forceDelete(int $id): bool
    {
        // Suppression définitive de la base de données
        return Product::onlyTrashed()->findOrFail($id)->forceDelete();
    }
}