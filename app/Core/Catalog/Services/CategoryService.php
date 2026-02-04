<?php

namespace App\Core\Catalog\Services;

use App\Models\Category;
use App\Core\Catalog\Dto\CategoryDto;
use App\Core\Catalog\Actions\CategoryAction;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

final class CategoryService
{
    public function __construct(
        private readonly CategoryAction $action
    ) {}

    /**
     * Récupère les catégories paginées avec leurs parents.
     */
    public function getPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return Category::with('parent')
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Récupère toutes les catégories actives pour un sélecteur (dropdown).
     */
    public function getActiveCategories(): Collection
    {
        return Category::where('is_active', true)->get();
    }

    /**
     * Orchestre la création via l'Action.
     */
    public function createCategory(CategoryDto $dto): Category
    {
        return $this->action->store($dto);
    }

    /**
     * Orchestre la mise à jour via l'Action.
     */
    public function updateCategory(Category $category, CategoryDto $dto): Category
    {
        return $this->action->update($category, $dto);
    }
    /**
     * Orchestre la suppression via l'Action.
     */
    public function deleteCategory(Category $category): bool
    {
        return $this->action->delete($category);
    }

    /**
 * Alterne l'état actif/inactif de la catégorie.
 */
public function toggleStatus(Category $category): bool
{
    return $category->update([
        'is_active' => !$category->is_active
    ]);
}
}
