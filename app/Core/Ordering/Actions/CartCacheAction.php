<?php

namespace App\Core\Ordering\Actions;

use Illuminate\Support\Facades\Cache;
use App\Core\Ordering\Dto\OrderItemDto;
use Illuminate\Support\Collection;

final class CartCacheAction
{
    private const KEY_PREFIX = 'primelab_cart:';
    private const TTL = 604800; // 7 jours en secondes

    /**
     * Récupère le panier depuis le cache (Redis, File, etc.)
     * @return Collection<int, OrderItemDto>
     */
    public static function get(int|string $ownerId): Collection
    {
        $data = Cache::get(self::KEY_PREFIX . $ownerId);

        if (!$data) {
            return collect();
        }

        // Gestion de la désérialisation selon le driver
        $items = is_string($data) ? json_decode($data, true) : $data;

        if (!is_array($items)) {
            return collect();
        }

        return collect($items)->map(fn($item) => OrderItemDto::fromArray((array)$item));
    }

    /**
     * Ajoute ou met à jour un produit de manière atomique avec un verrou (Lock).
     */
    public static function updateOrAdd(int|string $ownerId, OrderItemDto $newItem): void
    {
        $key = self::KEY_PREFIX . $ownerId;
        
        /**
         * Utilisation de Cache::lock pour gérer l'atomicité.
         * Fonctionne parfaitement sur Redis et simule un verrou sur File.
         */
        $lock = Cache::lock('lock_' . $key, 10);

        $lock->get(function () use ($ownerId, $newItem) {
            $cart = self::get($ownerId);

            $existingIndex = $cart->search(fn($item) => $item->productId === $newItem->productId);

            if ($existingIndex !== false) {
                $existing = $cart[$existingIndex];
                
                // On remplace l'item avec les nouvelles données fusionnées
                $cart[$existingIndex] = new OrderItemDto(
                    productId: $existing->productId,
                    quantity: $existing->quantity + $newItem->quantity,
                    price: $newItem->price,
                    unitAtPurchase: $newItem->unitAtPurchase ?? $existing->unitAtPurchase,
                    productNameAtPurchase: $newItem->productNameAtPurchase,
                    productImage: $newItem->productImage ?? $existing->productImage
                );
            } else {
                $cart->push($newItem);
            }

            self::save($ownerId, $cart);
        });
    }

    /**
     * Supprime un produit spécifique du panier.
     */
    public static function remove(int|string $ownerId, int $productId): void
    {
        $cart = self::get($ownerId);
        
        // On filtre et on réindexe pour éviter des clés JSON comme {"1":...} au lieu de [...]
        $filtered = $cart->filter(fn($item) => $item->productId !== $productId)->values();

        self::save($ownerId, $filtered);
    }

    /**
     * Vide complètement le panier.
     */
    public static function clear(int|string $ownerId): void
    {
        Cache::forget(self::KEY_PREFIX . $ownerId);
    }

    /**
     * Sauvegarde la collection dans le cache.
     */
    private static function save(int|string $ownerId, Collection $cart): void
    {
        $key = self::KEY_PREFIX . $ownerId;

        /**
         * ->values() est crucial ici : il réindexe le tableau de 0 à N.
         * Sans cela, le JSON produit pourrait être un objet au lieu d'une liste, 
         * ce qui ferait planter ton .map() en React (Inertia).
         */
        Cache::put($key, $cart->values()->toArray(), self::TTL);
    }
}