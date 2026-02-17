<?php

namespace App\Core\Catalog\Actions;

use App\Models\Product;
use App\Core\Catalog\Dto\ProductDto;
use App\Core\Catalog\Actions\ProductSeoGenerator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

 
 
use Illuminate\Support\Facades\Storage;
 
use Illuminate\Http\UploadedFile;
final class ProductAction
{
    public function __construct(
        private ProductSeoGenerator $seoGenerator
    ) {}

private function handleGallery(array $newFiles, array $existingPaths, ?array $oldPathsInDb = null): array
    {
      
        $gallery = $existingPaths;

        // 1. Nettoyage physique des images supprimées
        if ($oldPathsInDb) {
            $removedImages = array_diff($oldPathsInDb, $existingPaths);
            foreach ($removedImages as $path) {
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
          
                }
            }
        }

        // 2. Upload des nouvelles images
        foreach ($newFiles as $index => $file) {
            if ($file instanceof UploadedFile) {
                $path = $file->store('products', 'public');
                $gallery[] = $path;
             } else {
            }
        }

         return $gallery;
    }
public function create(ProductDto $dto): Product
    {
  
        return DB::transaction(function () use ($dto) {
            $gallery = $this->handleGallery($dto->image_files, []);
            $slug = $this->generateUniqueSlug($dto->slug ?: $dto->name['en'] ?? reset($dto->name));

            $product = Product::create([
                'category_id' => $dto->category_id,
                'name'        => $dto->name,
                'description' => $dto->description,
                'unit'        => $dto->unit,
                'slug'        => $slug,
                'sku'         => $dto->sku ?? $this->generateSku($dto),
                'price'       => $dto->price,
                'purity'      => $dto->purity,
                'stock'       => $dto->stock,
                'images'      => $gallery,
                'is_active'   => $dto->is_active,
                'is_featured' => $dto->is_featured,
            ]);

            $product->update([
                'meta' => $this->seoGenerator->generate($product, $dto->meta)
            ]);

             return $product;
        });
    }
public function update(Product $product, ProductDto $dto): Product
    {
 

        return DB::transaction(function () use ($product, $dto) {
            $updatedGallery = $this->handleGallery(
                $dto->image_files, 
                $dto->existing_images, 
                $product->images
            );

            $slug = $product->slug;
            if ($dto->slug && $dto->slug !== $product->slug) {
                $slug = $this->generateUniqueSlug($dto->slug, $product->id);
            }

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
                'images'      => $updatedGallery,
                'is_active'   => $dto->is_active,
                'is_featured' => $dto->is_featured,
            ]);

            $product->update([
                'meta' => $this->seoGenerator->generate($product, $dto->meta)
            ]);

            $product = $product->fresh();
 

            return $product;
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
    $product = Product::onlyTrashed()->findOrFail($id);
    
    if (is_array($product->images)) {
        foreach ($product->images as $path) {
            Storage::disk('public')->delete($path);
        }
    }

    return $product->forceDelete();
}
}