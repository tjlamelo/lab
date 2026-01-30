<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Category extends Model
{
  
    // Autoriser le remplissage de masse
    protected $fillable = [
        'name',
        'slug',
        'description',
        'parent_id',
        'image',
        'is_active'
    ];

    // Conversion automatique du JSON en tableau PHP
    protected $casts = [
        'name' => 'array',
        'description' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Boot function pour générer le slug automatiquement
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            // On génère le slug à partir du nom français par défaut lors de la création
            if (empty($category->slug) && isset($category->name['fr'])) {
                $category->slug = Str::slug($category->name['fr']);
            }
        });
    }

    /**
     * Relation : Une catégorie peut avoir plusieurs produits
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Relation : Une catégorie peut avoir une catégorie parente
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Relation : Une catégorie peut avoir plusieurs sous-catégories
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }
    // app/Models/Category.php

public function getTranslation(string $field)
{
    $translations = $this->$field;
    $locale = app()->getLocale();

    // On s'assure que $translations est bien un tableau (dû au casting array)
    if (!is_array($translations)) return $translations;

    return $translations[$locale] 
        ?? $translations['en'] 
        ?? ($translations ? reset($translations) : '');
}
}