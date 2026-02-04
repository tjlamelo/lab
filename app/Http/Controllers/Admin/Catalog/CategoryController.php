<?php

namespace App\Http\Controllers\Admin\Catalog;

use App\Http\Controllers\Controller;
use App\Core\Catalog\Services\CategoryService;
use App\Core\Catalog\Dto\CategoryDto;
use App\Http\Requests\Admin\Catalog\CategoryRequest;
use App\Http\Resources\Admin\CategoryRessource; // Import de la ressource
use App\Models\Category;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    /**
     * Liste des catégories.
     */
    public function index(): Response
    {
        $categories = $this->categoryService->getPaginated();

        return Inertia::render('admin/catalog/categories/index', [
            // On transforme la collection paginée via la ressource
            'categories' => CategoryRessource::collection($categories)
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create(): Response
    {
        return Inertia::render('admin/catalog/categories/create', [
            // Utilisation de la ressource pour la cohérence des noms traduits
            'parentCategories' => CategoryRessource::collection(
                $this->categoryService->getActiveCategories()
            )
        ]);
    }

    /**
     * Enregistre une nouvelle catégorie.
     */
    public function store(CategoryRequest $request)
    {
        $dto = CategoryDto::fromArray($request->validated());
        $this->categoryService->createCategory($dto);

        return redirect()->route('categories.index')
            ->with('success', __('Category created successfully!'));
    }

    /**
     * Formulaire d'édition.
     */
    public function edit(Category $category): Response
    {
        return Inertia::render('admin/catalog/categories/edix', [
            // On passe l'objet category via la ressource pour avoir name_translations
            'category' => new CategoryRessource($category),
            'parentCategories' => CategoryRessource::collection(
                $this->categoryService->getActiveCategories()
                    ->filter(fn ($c) => $c->id !== $category->id)
            )
        ]);
    }
/**
 * Affiche le détail d'une catégorie.
 */
public function show(Category $category): Response
{
    // On charge la relation 'parent' pour afficher son nom dans la vue
    // On charge aussi 'children' si tu veux lister les sous-catégories plus tard
    $category->load(['parent']);

    return Inertia::render('admin/catalog/categories/show', [
        'category' => new CategoryRessource($category)
    ]);
}
    /**
     * Met à jour la catégorie.
     */
    public function update(CategoryRequest $request, Category $category)
    {
        $dto = CategoryDto::fromArray($request->validated());
        $this->categoryService->updateCategory($category, $dto);

        return Redirect::route('categories.index')
            ->with('success', __('Category updated successfully!'));
    }

    /**
     * Supprime la catégorie.
     */
    public function destroy(Category $category)
    {
        $this->categoryService->deleteCategory($category);

        return Redirect::back()
            ->with('success', __('Category deleted successfully!'));
    }

    /**
 * Bascule l'état de la catégorie (Active/Inactive).
 */
public function toggle(Category $category)
{
    $this->categoryService->toggleStatus($category);

    return Redirect::back()
        ->with('success', __('Category status updated!'));
}
}