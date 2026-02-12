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
    public function getCart(int $userId): array
    {
        $items = CartCacheAction::get($userId);

        return [
            'items' => $items,
            'count' => $items->sum('quantity'),
            'total' => $this->calculateTotal($items),
        ];
    }

    /**
     * Add an item to the cart or increment quantity.
     */
    public function addItem(int $userId, OrderItemDto $item): void
    {
        // Business Rule: Check for maximum quantity per item if needed
        // if ($item->quantity > 100) throw new Exception("Quantity limit exceeded");

        CartCacheAction::updateOrAdd($userId, $item);
    }

    /**
     * Remove a specific product from the cart.
     */
    public function removeItem(int $userId, int $productId): void
    {
        CartCacheAction::remove($userId, $productId);
    }

    /**
     * Completely empty the cart.
     */
    public function emptyCart(int $userId): void
    {
        CartCacheAction::clear($userId);
    }

    /**
     * Update the quantity of an item directly (overwrite).
     */
    public function setItemQuantity(int $userId, int $productId, int $quantity): void
    {
        $cart = CartCacheAction::get($userId);
        $item = $cart->firstWhere('productId', $productId);

// Dans CartCacheService.php -> setItemQuantity
if ($item) {
    $this->removeItem($userId, $productId);
    
    if ($quantity > 0) {
        $this->addItem($userId, new OrderItemDto(
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