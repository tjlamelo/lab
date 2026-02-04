<?php

namespace App\Core\Catalog\Actions;

use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;

final class ProductSeoGenerator
{
    /**
     * Génère dynamiquement les métadonnées SEO pour un produit.
     */
   public function generate(Product $product, ?array $existingMeta = null, ?string $locale = null): array
{
    // LOG 1 : État initial - Qu'est-ce que le contrôleur passe réellement au générateur ?
    \Log::info("SEO_DEBUG [1] Initial Data", [
        'product_id' => $product->id,
        'locale_requested' => $locale,
        'existingMeta_received' => $existingMeta
    ]);

    $meta = $existingMeta ?? [];
    
    // Initialisation des structures
    $meta['seo'] = $meta['seo'] ?? [];
    $meta['open_graph'] = $meta['open_graph'] ?? [];
    $meta['x'] = $meta['x'] ?? [];
    $meta['schema'] = $meta['schema'] ?? [];

    $nameTranslations = $product->getAllTranslations('name');
    $locales = !empty($nameTranslations) ? array_keys($nameTranslations) : [config('app.locale', 'en')];

    if ($locale && in_array($locale, $locales)) {
        $locales = [$locale];
    }

    foreach ($locales as $loc) {
        // Vérification du verrouillage
        if (isset($meta['seo']['locked'][$loc]) && $meta['seo']['locked'][$loc] === true) {
            \Log::info("SEO_DEBUG [2] Locked", ['locale' => $loc]);
            continue;
        }

        // LOG 3 : Tentative d'extraction des mots-clés
        // On vérifie si la structure est $meta['seo']['keywords'][$loc] 
        // ou si c'est $meta[$loc]['keywords'] (comme vu dans ton payload front)
// On récupère les keywords depuis la structure reçue ($meta[$loc]['keywords'])
$keywords = $meta[$loc]['keywords'] ?? '';
        \Log::info("SEO_DEBUG [3] Keywords Extraction", [
            'locale' => $loc,
            'extracted_keywords' => $keywords,
            'full_meta_structure' => $meta // Pour voir où sont cachés les keywords s'ils sont vides
        ]);

        if (empty($keywords)) {
            $keywords = $this->generateAutomaticKeywords($product, $loc);
            \Log::info("SEO_DEBUG [4] Auto-generation triggered", ['locale' => $loc, 'result' => $keywords]);
        }

        // --- GÉNÉRATION DES AUTRES CHAMPS ---
        $unitLabel = $product->unit ?? '';
        $seoTitle = $meta['seo']['title'][$loc] ?? ($product->getTranslation('name', $loc) . ' - ' . config('app.name'));
        
        $rawDescription = $product->getTranslation('description', $loc);
        $pricePrefix = ($loc === 'fr') ? 'Prix : ' : 'Price: ';
        $fullDescription = $pricePrefix . $product->price . '$ / ' . $unitLabel . '. ' . strip_tags($rawDescription);
        $seoDescription = $meta['seo']['description'][$loc] ?? \Str::limit($fullDescription, 155);

        // --- MAPPING FINAL ---
        $score = $this->calculateScore($seoTitle, $seoDescription, $keywords, $product);
        $ogImage = $this->getProductImage($product);

        $meta['seo']['title'][$loc] = $seoTitle;
        $meta['seo']['description'][$loc] = $seoDescription;
        $meta['seo']['keywords'][$loc] = $keywords;
        $meta['seo']['score'][$loc] = $score;
        
        $meta['open_graph']['title'][$loc] = $seoTitle;
        $meta['open_graph']['description'][$loc] = $seoDescription;
        $meta['open_graph']['image'] = $ogImage;
        $meta['open_graph']['type'] = 'og:product';

        $meta['x']['title'][$loc] = $seoTitle;
        $meta['x']['description'][$loc] = $seoDescription;
        $meta['x']['image'] = $ogImage;
        $meta['x']['card'] = 'summary_large_image';

        $meta['schema'][$loc] = $this->generateProductSchema($product, $loc, $meta);
    }

    // Paramètres globaux
    $meta['robots'] = ['index' => (bool)($product->is_active ?? true), 'follow' => true];
    
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
    /**
 * Génère une liste de mots-clés basée sur le produit et sa catégorie.
 */
private function generateAutomaticKeywords(Product $product, string $loc): string
{
    $name = $product->getTranslation('name', $loc);
    $categoryName = $product->category ? $product->category->getTranslation('name', $loc) : '';
    
    $tags = [
        $name,
        $categoryName,
        config('app.name'),
        $product->sku
    ];

    // On ajoute des termes génériques selon la langue
    $suffixes = ($loc === 'fr') 
        ? ['laboratoire', 'chimie', 'achat', 'prix'] 
        : ['laboratory', 'chemical', 'buy', 'price'];

    $allKeywords = array_merge($tags, $suffixes);
    
    // Nettoyage : suppression des doublons et des valeurs vides
    return implode(', ', array_unique(array_filter($allKeywords)));
}

private function getProductImage(Product $product): string
{
    Log::info("Debug Image Produit ID {$product->id}:", [
        'raw_images' => $product->images,
        'is_array' => is_array($product->images),
        'type' => gettype($product->images)
    ]);

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