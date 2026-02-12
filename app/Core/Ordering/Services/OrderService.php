<?php

namespace App\Core\Ordering\Services;

use App\Models\Order;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Core\Ordering\Dto\OrderDto;
use App\Core\Ordering\Actions\OrderAction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class OrderService
{
    public function __construct(
        private readonly OrderItemService $orderItemService
    ) {}

    /**
     * Handles the complete checkout process.
     */
    public function placeOrder(OrderDto $dto): Order
    {
        return DB::transaction(function () use ($dto) {
            $order = OrderAction::create($dto);
            $this->orderItemService->createItemsForOrder($order, $dto->items);
            return $order;
        });
    }

    /**
     * Mise à jour du statut logistique (Expédié, Livré, etc.)
     */
    public function updateStatus(Order $order, OrderStatus $newStatus): void
    {
        // On pourrait ajouter ici des vérifications supplémentaires avant l'action
        OrderAction::updateStatus($order, $newStatus);
    }

    /**
     * Mise à jour du statut de paiement
     */
    public function updatePaymentStatus(Order $order, PaymentStatus $newStatus): void
    {
        OrderAction::updatePaymentStatus($order, $newStatus);
    }

    /**
     * Submit payment and transition status.
     */
    public function processPaymentProof(Order $order, string $filePath): void
    {
        if ($order->status !== OrderStatus::WAITING_PAYMENT) {
            throw ValidationException::withMessages([
                'order' => __('Payment proof can only be submitted for orders awaiting payment.')
            ]);
        }

        OrderAction::submitPaymentProof($order, $filePath);
    }

    /**
     * Administrative action to confirm payment.
     */
    public function confirmPayment(Order $order): void
    {
        if ($order->payment_status !== PaymentStatus::WAITING_VERIFICATION) {
            throw ValidationException::withMessages([
                'payment_status' => __('Order has no payment proof to verify or is already processed.')
            ]);
        }

        OrderAction::verifyPayment($order);
    }

    /**
     * Cancel order and handle logic.
     */
    public function cancelOrder(Order $order): void
    {
        $restrictedStatuses = [
            OrderStatus::SHIPPING, 
            OrderStatus::DELIVERED, 
            OrderStatus::CANCELLED
        ];

        if (in_array($order->status, $restrictedStatuses)) {
            throw ValidationException::withMessages([
                'order' => __('This order cannot be cancelled anymore.')
            ]);
        }

        OrderAction::cancel($order);
    }

    /**
     * Récupère les commandes avec filtres et pagination.
     */
    public function listOrders(array $filters = [], int $perPage = 15)
    {
        return Order::query()
            ->with(['paymentMethod', 'user:id,name,email']) 
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($u) use ($search) {
                          $u->where('email', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['payment_status'] ?? null, function ($query, $pStatus) {
                $query->where('payment_status', $pStatus);
            })
            ->when($filters['date'] ?? null, function ($query, $date) {
                $query->whereDate('created_at', $date);
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }
}