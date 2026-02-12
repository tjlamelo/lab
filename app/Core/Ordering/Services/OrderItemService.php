<?php

namespace App\Core\Ordering\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Core\Ordering\Dto\OrderItemDto;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class OrderItemService
{
    /**
     * Attaches multiple items to an existing order.
     * * @param Order $order
     * @param OrderItemDto[] $items
     * @return Collection
     */
public function createItemsForOrder(Order $order, array $items): Collection
    {
        return DB::transaction(function () use ($order, $items) {
            $createdItems = collect();

            foreach ($items as $itemData) {
                // On s'assure d'avoir un DTO même si les données arrivent en array
                $dto = $itemData instanceof OrderItemDto ? $itemData : OrderItemDto::fromArray($itemData);
                $createdItems->push($this->addItem($order, $dto));
            }

            // Une seule synchronisation à la fin pour la performance
            $this->syncOrderTotal($order);

            return $createdItems;
        });
    }

    /**
     * Adds a single item to an order and calculates totals.
     */
   // app/Core/Ordering/Services/OrderItemService.php

public function addItem(Order $order, OrderItemDto $dto): OrderItem
    {
        return $order->items()->create([
            'product_id'               => $dto->productId,
            'quantity'                 => $dto->quantity,
            'price'                    => $dto->price,
            'unit_at_purchase'         => $dto->unitAtPurchase,
            'product_name_at_purchase' => $dto->productNameAtPurchase,
        ]);
    }

    /**
     * Logic for calculating subtotal, including potential 
     * item-level discounts or taxes in the future.
     */
    private function calculateSubtotal(float $price, int $quantity): float
    {
        return $price * $quantity;
    }

    /**
     * Updates an existing item's quantity and synchronizes the order total.
     */
public function updateQuantity(OrderItem $item, int $newQuantity): void
    {
        DB::transaction(function () use ($item, $newQuantity) {
            $item->update(['quantity' => $newQuantity]);

            // Recalcul du total de la commande parente
            $this->syncOrderTotal($item->order);
        });
    }
    /**
     * Ensures the parent Order total matches the sum of its Items.
     */
  public function syncOrderTotal(Order $order): void
    {
        // On calcule la somme (quantité * prix) de tous les items
        $newTotal = $order->items()
            ->get()
            ->sum(fn($item) => $item->quantity * $item->price);

        $order->update(['total_amount' => $newTotal]);
    }
}