<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'slug'        => $this->slug,
            'sku'         => $this->sku,
            
            // 1. Traduction simple pour l'affichage rapide (UI)
            'name'        => $this->getTranslation('name'), 
            'description' => $this->getTranslation('description'),
            
            // 2. Traductions COMPLÈTES pour les onglets (React Tabs)
            'name_translations'        => $this->name,        // Envoie tout le JSON
            'description_translations' => $this->description, // Envoie tout le JSON
            
            'price'       => (float) $this->price,
            'stock'       => $this->stock,
            'unit'        => $this->unit, 
            'purity'      => $this->purity,
            
            // 3. Les images pour la galerie
            'images'      => $this->images ?? [],
            
            // 4. Les métadonnées (SEO inclu dedans)
            'meta'        => $this->meta ?? [],
            
            'is_active'   => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            
            'created_at'  => $this->created_at?->format('Y-m-d H:i'),
            'updated_at'  => $this->updated_at?->format('Y-m-d H:i'),

            'category'    => $this->whenLoaded('category', function() {
                return [
                    'id'   => $this->category->id,
                    'name' => $this->category->getTranslation('name')
                ];
            }),
        ];
    }
}