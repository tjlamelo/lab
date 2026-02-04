<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryRessource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'    => $this->id,
            'slug'  => $this->slug,

            // 1. Traduction pour l'affichage (Tableau/Index)
            'name'        => $this->getTranslation('name', app()->getLocale()),
            'description' => $this->getTranslation('description', app()->getLocale()),

            // 2. Objets complets pour les formulaires (React Tabs)
            // Comme tu utilises Spatie Translatable ou JSON, $this->name renvoie l'objet {fr: '...', en: '...'}
            'name_translations'        => $this->name, 
            'description_translations' => $this->description,

            // 3. Configuration
            'parent_id' => $this->parent_id,
            'image'     => $this->image,
            'is_active' => (bool) $this->is_active,

            // 4. Relation (Optionnel, utile pour afficher le nom du parent dans l'index)
            'parent' => $this->whenLoaded('parent', function() {
                return [
                    'id'   => $this->parent->id,
                    'name' => $this->parent->getTranslation('name', app()->getLocale()),
                ];
            }),

            'created_at' => $this->created_at?->format('Y-m-d H:i'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i'),
        ];
    }
}