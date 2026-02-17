<?php

namespace App\Core\Catalog\Actions;

use App\Models\Category;
use App\Core\Catalog\Dto\CategoryDto;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile; // CRUCIAL : Sans cet import, instanceof échoue
use Illuminate\Support\Facades\Log;
 

 
final class CategoryAction
{
    public function store(CategoryDto $dto): Category
    {
        $data = [
            'name'        => $dto->name,
            'slug'        => $this->generateUniqueSlug($dto->name),
            'description' => $dto->description,
            'parent_id'   => $dto->parentId === 'none' ? null : $dto->parentId,
            'is_active'   => $dto->isActive,
        ];

        if ($dto->image instanceof UploadedFile) {
            $data['image'] = $dto->image->store('categories', 'public');
        }

        return Category::create($data);
    }


public function update(Category $category, CategoryDto $dto): Category
{
    Log::info("🚀 Début de l'update pour la catégorie ID: {$category->id}");

    $data = [
        'name'        => $dto->name,
        'description' => $dto->description,
        'parent_id'   => $dto->parentId, // Le DTO gère déjà le 'none' -> null
        'is_active'   => $dto->isActive,
    ];

    // 1. Gestion du Slug
    if ($dto->name !== $category->name) {
        $data['slug'] = $this->generateUniqueSlug($dto->name, $category->id);
        Log::info("🔗 Nouveau slug généré : {$data['slug']}");
    }

    // 2. Gestion de l'image (Robuste)
    if ($dto->image instanceof UploadedFile) {
        Log::info("📸 Nouveau fichier image détecté : " . $dto->image->getClientOriginalName());

        // Supprimer l'ancienne image si elle existe
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
            Log::info("🗑️ Ancienne image supprimée : {$category->image}");
        }

        // Stocker la nouvelle
        $data['image'] = $dto->image->store('categories', 'public');
        Log::info("💾 Nouvelle image stockée : {$data['image']}");

    } else {
        // IMPORTANT : Si ce n'est pas un UploadedFile, on ne touche PAS à la clé 'image'.
        // On ne met pas $data['image'] = null, sinon Laravel écrasera la valeur en BDD.
        Log::info("ℹ️ Pas de changement d'image (reçu: " . gettype($dto->image) . ")");
        
        // Optionnel : Si tu veux gérer une suppression explicite via un bouton "Supprimer"
        // il faudrait envoyer une valeur spécifique comme 'DELETE_IMAGE'
        if ($dto->image === 'DELETE_IMAGE') {
             if ($category->image) {
                Storage::disk('public')->delete($category->image);
             }
             $data['image'] = null;
             Log::info("🗑️ Image supprimée explicitement par l'utilisateur.");
        }
    }

    $category->update($data);
    Log::info("✅ Mise à jour réussie pour la catégorie : {$category->id}");

    return $category;
}

    private function generateUniqueSlug(array $names, ?int $exceptId = null): string
    {
        $baseName = $names['en'] ?? $names['fr'] ?? reset($names);
        $slug = Str::slug($baseName ?: 'category');
        $originalSlug = $slug;
        $count = 1;

        while (Category::where('slug', $slug)->where('id', '!=', $exceptId)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        return $slug;
    }

    public function delete(Category $category): bool
    {
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }
        return $category->delete();
    }
}