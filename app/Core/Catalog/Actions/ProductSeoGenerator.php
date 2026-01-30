<?php

namespace App\Core\Catalog\Actions;

use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;

final class ProductSeoGenerator
{
    /**
     * Génère dynamiquement les métadonnées SEO pour un produit.
     */
    public function generate(Product $product, ?array $existingMeta = null, ?string $locale = null): array
    {
        $meta = $existingMeta ?? [];
        
        // Initialisation des structures de données
        $meta['seo'] = $meta['seo'] ?? [];
        $meta['open_graph'] = $meta['open_graph'] ?? [];
        $meta['x'] = $meta['x'] ?? [];
        $meta['schema'] = $meta['schema'] ?? [];

        // Récupération des locales via la méthode personnalisée du modèle
        $nameTranslations = $product->getAllTranslations('name');
        $locales = !empty($nameTranslations) ? array_keys($nameTranslations) : [config('app.locale', 'en')];

        // Si une locale spécifique est demandée
        if ($locale && in_array($locale, $locales)) {
            $locales = [$locale];
        }

        foreach ($locales as $loc) {
            // Ignorer si le SEO est manuellement verrouillé par l'admin pour cette langue
            if (isset($meta['seo']['locked'][$loc]) && $meta['seo']['locked'][$loc] === true) {
                continue;
            }

            // L'unité est maintenant une string simple (non traduite)
            $unitLabel = $product->unit ?? '';

            // --- TITRE SEO ---
            $seoTitle = $meta['seo']['title'][$loc] 
                ?? ($product->getTranslation('name', $loc) . ' - ' . config('app.name'));

            // --- DESCRIPTION SEO (Prix + Unité + Description) ---
            $rawDescription = $product->getTranslation('description', $loc);
            $pricePrefix = ($loc === 'fr') ? 'Prix : ' : 'Price: ';
            
            // Construction d'une description riche pour Google
            $fullDescription = $pricePrefix . $product->price . '$ / ' . $unitLabel . '. ' . strip_tags($rawDescription);

            $seoDescription = $meta['seo']['description'][$loc]
                ?? Str::limit($fullDescription, 155);

            // --- MOTS CLÉS ---
            $keywords = $meta['seo']['keywords'][$loc] ?? '';

            // Calcul du score SEO
            $score = $this->calculateScore($seoTitle, $seoDescription, $keywords, $product);
            $ogImage = $this->getProductImage($product);

            // Mapping SEO standard
            $meta['seo']['title'][$loc] = $seoTitle;
            $meta['seo']['description'][$loc] = $seoDescription;
            $meta['seo']['keywords'][$loc] = $keywords;
            $meta['seo']['score'][$loc] = $score;
            
            // Open Graph (Réseaux sociaux)
            $meta['open_graph']['title'][$loc] = $seoTitle;
            $meta['open_graph']['description'][$loc] = $seoDescription;
            $meta['open_graph']['image'] = $ogImage;
            $meta['open_graph']['type'] = 'og:product';

            // X (Twitter)
            $meta['x']['title'][$loc] = $seoTitle;
            $meta['x']['description'][$loc] = $seoDescription;
            $meta['x']['image'] = $ogImage;
            $meta['x']['card'] = 'summary_large_image';

            // Données structurées (Schema.org)
            $meta['schema'][$loc] = $this->generateProductSchema($product, $loc, $meta);
        }

        // Paramètres globaux
        $meta['robots'] = [
            'index' => (bool)($product->is_active ?? true), 
            'follow' => true
        ];

        try {
            $meta['canonical'] = $meta['canonical'] ?? (Route::has('products.show') 
                ? route('products.show', $product->slug) 
                : url('/products/' . $product->slug));
        } catch (\Exception $e) {
            $meta['canonical'] = url('/products/' . ($product->slug ?? $product->id));
        }

        return $meta;
    }

    private function calculateScore(string $title, string $description, string $keywords, Product $product): int
    {
        $score = 0;
        if (strlen($title) >= 50 && strlen($title) <= 70) $score += 25;
        if (strlen($description) >= 120 && strlen($description) <= 160) $score += 25;
        if (!empty($keywords)) $score += 20; 
        if ($product->price > 0) $score += 20;
        if (!empty($product->unit)) $score += 10;

        return min($score, 100);
    }

    private function getProductImage(Product $product): string
    {
        if (!empty($product->images) && is_array($product->images)) {
            return asset('storage/' . $product->images[0]);
        }
        return asset('img/placeholders/product-default.png');
    }

    private function generateProductSchema(Product $product, string $locale, array $meta): array
    {
        $unitLabel = $product->unit ?? '';
        $breadcrumbs = [];
        
        if ($product->category) {
            $breadcrumbs[] = [
                "@type" => "ListItem",
                "position" => 1,
                "name" => $product->category->getTranslation('name', $locale) ?? $product->category->name,
                "item" => url('/category/' . ($product->category->slug ?? $product->category->id))
            ];
        }

        return [
            "@context" => "https://schema.org/",
            "@type" => "Product",
            "name" => $product->getTranslation('name', $locale),
            "description" => $meta['seo']['description'][$locale] ?? '',
            "image" => $this->getProductImage($product),
            "sku" => $product->sku ?? "PROD-" . $product->id,
            "brand" => [
                "@type" => "Brand",
                "name" => config('app.name')
            ],
            "offers" => [
                "@type" => "Offer",
                "priceCurrency" => "USD",
                "price" => $product->price,
                "priceValidUntil" => date('Y-12-31'),
                "description" => "Price per " . $unitLabel,
                "availability" => ($product->stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "url" => url('/products/' . $product->slug)
            ],
            "breadcrumb" => [
                "@type" => "BreadcrumbList",
                "itemListElement" => $breadcrumbs
            ]
        ];
    }
}