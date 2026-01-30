<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // On récupère la locale actuelle (ex: 'en', 'fr')
        $locale = app()->getLocale();

        return [
            'id'          => $this->id,
            'slug'        => $this->slug,
            // Utilisation du helper getTranslation() au lieu du cast (string)
            'name'        => $this->getTranslation('name'), 
            'description' => $this->getTranslation('description'),
            'price'       => $this->price,
            'stock'       => $this->stock,
            
      
          'unit'        => $this->unit, 'purity'      => $this->purity,
            'brand'       => $this->brand,
            'is_active'   => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            'updated_at'  => $this->updated_at->format('Y-m-d'),
          'category'    => $this->whenLoaded('category', function() {
            return [
                'id' => $this->category->id,
                'name' => $this->category->getTranslation('name', app()->getLocale())
            ];
        }),
        ];
    }
}