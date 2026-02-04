<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'unit', // Ajouté
        'meta',
        'slug',
        'sku',
        'price',
        'stock',
        'purity',
        'images',
        'is_active',
        'is_featured'
    ];

    protected $casts = [
        'name' => 'array',
        'description' => 'array',
        'unit' => 'string', // Ajouté pour gérer les traductions d'unités
        'meta' => 'array',
        'images' => 'array',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];
public function getRouteKeyName(): string
{
    return 'slug';
}

    /**
     * Relation avec la catégorie
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
 /**
     * Retourne toutes les langues disponibles pour un champ
     */
    public function getAllTranslations(string $field): array
    {
        return is_array($this->$field) ? $this->$field : [];
    }

    /**
     * Helper pour obtenir la traduction selon la locale
     */
    public function getTranslation(string $field, ?string $locale = null)
    {
        // Cas particulier pour 'unit' qui est une string simple (Option A)
        if ($field === 'unit') {
            return $this->unit;
        }

        $translations = $this->$field;
        if (!is_array($translations)) return '';

        $locale = $locale ?? app()->getLocale();

        return $translations[$locale] 
            ?? $translations['en'] 
            ?? ($translations ? reset($translations) : '');
    }
}