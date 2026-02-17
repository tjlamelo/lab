<?php

namespace App\Core\Ordering\Services;

use App\Core\Ordering\Actions\CartCacheAction;
use App\Core\Ordering\Dto\OrderItemDto;
use Illuminate\Support\Collection;

final class CartCacheService
{
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

// Dans CartCacheService.php -> setItemQuantity
if ($item) {
    $this->removeItem($ownerId, $productId);
    
    if ($quantity > 0) {
        $this->addItem($ownerId, new OrderItemDto(
            productId: $item->productId,
            quantity: $quantity,
            price: $item->price,
            productNameAtPurchase: $item->productNameAtPurchase,
            productImage: $item->productImage, // NE PAS OUBLIER
            unitAtPurchase: $item->unitAtPurchase // NE PAS OUBLIER
        ));
    }
}
    }

    /**
     * Calculate the total amount of the cart.
     */
    private function calculateTotal(Collection $items): float
    {
        return $items->reduce(function ($carry, OrderItemDto $item) {
            return $carry + ($item->price * $item->quantity);
        }, 0.0);
    }
}