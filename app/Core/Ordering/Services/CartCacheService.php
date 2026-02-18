<?php

namespace App\Core\Ordering\Services;

use App\Core\Ordering\Actions\CartCacheAction;
use App\Core\Ordering\Dto\OrderItemDto;
use App\Models\Product;
use Illuminate\Support\Collection;

final class CartCacheService
{
    private const CALUANIE_SLUG = 'caluanie-muelear-oxidize';

    /**
     * Tarifs spéciaux Caluanie (total pour X litres).
     */
    private const CALUANIE_PRICING = [
        1 => 1000,
        2 => 1800,
        5 => 9000,
        10 => 18000,
        15 => 27000,
        20 => 36000,
        25 => 45000,
        30 => 54000,
        35 => 63000,
        40 => 72000,
        45 => 81000,
        50 => 90000,
        55 => 99000,
        60 => 108000,
        65 => 117000,
        70 => 126000,
        75 => 135000,
        80 => 144000,
        85 => 153000,
        90 => 162000,
        95 => 171000,
        100 => 180000,
    ];
    /**
     * Retrieve the user's cart with calculated metadata.
     */
    public function getCart(int|string $ownerId): array
    {
        $items = CartCacheAction::get($ownerId);

        return [
            'items' => $items,
            'count' => $items->sum('quantity'),
            'total' => $this->calculateTotal($items),
        ];
    }

    /**
     * Add an item to the cart or increment quantity.
     */
    public function addItem(int|string $ownerId, OrderItemDto $item): void
    {
        // Business Rule: Check for maximum quantity per item if needed
        // if ($item->quantity > 100) throw new Exception("Quantity limit exceeded");

        CartCacheAction::updateOrAdd($ownerId, $item);
    }

    /**
     * Remove a specific product from the cart.
     */
    public function removeItem(int|string $ownerId, int $productId): void
    {
        CartCacheAction::remove($ownerId, $productId);
    }

    /**
     * Completely empty the cart.
     */
    public function emptyCart(int|string $ownerId): void
    {
        CartCacheAction::clear($ownerId);
    }

    /**
     * Merge a guest cart into an authenticated user's cart.
     *
     * Used, for example, after login so the user does not lose
     * the items they added before being redirected to authenticate.
     */
    public function mergeCarts(int|string $fromOwnerId, int|string $toOwnerId): void
    {
        if ($fromOwnerId === $toOwnerId) {
            return;
        }

        $fromItems = CartCacheAction::get($fromOwnerId);

        if ($fromItems->isEmpty()) {
            return;
        }

        foreach ($fromItems as $item) {
            // Réutilise la règle métier d'addition/mise à jour
            CartCacheAction::updateOrAdd($toOwnerId, $item);
        }

        // On vide ensuite l'ancien panier invité
        CartCacheAction::clear($fromOwnerId);
    }

    /**
     * Update the quantity of an item directly (overwrite).
     */
    public function setItemQuantity(int|string $ownerId, int $productId, int $quantity): void
    {
        $cart = CartCacheAction::get($ownerId);
        $item = $cart->firstWhere('productId', $productId);

        // Protection supplémentaire côté service : clamp entre 0 et 100.
        $clampedQuantity = max(0, min(100, $quantity));

        // Pour Caluanie, on force la quantité exactement sur l'un des paliers
        // définis (1, 2, 5, 10, ..., 100) pour garder un système cohérent.
        if ($clampedQuantity > 0) {
            $product = Product::find($productId);
            if ($product && $product->slug === self::CALUANIE_SLUG) {
                $clampedQuantity = $this->closestCaluanieTier((int) round($clampedQuantity));
            }
        }

        if ($item) {
            $this->removeItem($ownerId, $productId);

            if ($clampedQuantity > 0) {
                $this->addItem($ownerId, new OrderItemDto(
                    productId: $item->productId,
                    quantity: $clampedQuantity,
                    price: $item->price,
                    productNameAtPurchase: $item->productNameAtPurchase,
                    productImage: $item->productImage,
                    unitAtPurchase: $item->unitAtPurchase
                ));
            }
        }
    }

    /**
     * Calculate the total amount of the cart.
     */
    private function calculateTotal(Collection $items): float
    {
        if ($items->isEmpty()) {
            return 0.0;
        }

        // Précharger les produits concernés pour pouvoir appliquer des règles tarifaires spécifiques.
        $productIds = $items->pluck('productId')->unique()->all();
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        return $items->reduce(function (float $carry, OrderItemDto $item) use ($products) {
            /** @var Product|null $product */
            $product = $products->get($item->productId);

            return $carry + $this->calculateItemTotal($item, $product);
        }, 0.0);
    }

    /**
     * Calcule le total d'une ligne de panier, en appliquant si besoin
     * la grille tarifaire spéciale pour le Caluanie.
     */
    private function calculateItemTotal(OrderItemDto $item, ?Product $product): float
    {
        if ($product && $product->slug === self::CALUANIE_SLUG) {
            // On considère la quantité en litres comme un entier et on la
            // "snap" au palier le plus proche de la grille officielle.
            $liters = (int) round($item->quantity);
            $closestLiters = $this->closestCaluanieTier($liters);

            return self::CALUANIE_PRICING[$closestLiters];
        }

        return $item->price * $item->quantity;
    }

    /**
     * Retourne le palier Caluanie le plus proche (1, 2, 5, 10, ..., 100)
     * pour éviter des cas comme 98L moins cher que 90L.
     */
    private function closestCaluanieTier(int $liters): int
    {
        $tiers = array_keys(self::CALUANIE_PRICING);
        sort($tiers);

        // Clamp dans les bornes
        if ($liters <= $tiers[0]) {
            return $tiers[0];
        }
        $lastIndex = count($tiers) - 1;
        if ($liters >= $tiers[$lastIndex]) {
            return $tiers[$lastIndex];
        }

        // Cherche le palier le plus proche
        $closest = $tiers[0];
        $minDiff = PHP_INT_MAX;

        foreach ($tiers as $tier) {
            $diff = abs($tier - $liters);
            if ($diff < $minDiff) {
                $minDiff = $diff;
                $closest = $tier;
            }
        }

        return $closest;
    }
}