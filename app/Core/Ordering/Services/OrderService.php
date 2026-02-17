<?php

namespace App\Core\Ordering\Services;

use App\Models\Order;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Core\Ordering\Dto\OrderDto;
use App\Core\Ordering\Actions\OrderAction;
use App\Core\Mailing\Helpers\MailHelper;
use App\Core\Mailing\Services\MailService;
use App\Core\Mailing\Dto\MailDto;
use App\Mail\OrderConfirmationMail;
use App\Mail\OrderShippedMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class OrderService
{
    public function __construct(
        private readonly OrderItemService $orderItemService,
        private readonly MailService $mailService,
    ) {}

    /**
     * Handles the complete checkout process.
     */
    public function placeOrder(OrderDto $dto): Order
    {
        $order = DB::transaction(function () use ($dto) {
            $order = OrderAction::create($dto);
            $this->orderItemService->createItemsForOrder($order, $dto->items);
            return $order;
        });

        // Envoi d'un email de confirmation de commande (robuste, non bloquant pour la logique métier)
        $this->sendOrderConfirmationMail($order);

        // Notification aux admins / managers : nouvelle commande à traiter
        try {
            MailHelper::notifyAdminsAndManagers(
                subject: __('New order placed: :orderNumber', ['orderNumber' => $order->order_number]),
                content: [
                    __('A new order has been placed and may require your attention.'),
                    'ID: #' . $order->id . ' – ' . ($order->user->email ?? 'guest'),
                    route('admin.orders.show', ['id' => $order->id]),
                ],
            );
        } catch (\Throwable $e) {
            Log::error('OrderService::placeOrder admin notification failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $order;
    }

    /**
     * Mise à jour du statut logistique (Expédié, Livré, etc.)
     */
    public function updateStatus(Order $order, OrderStatus $newStatus): void
    {
        // On pourrait ajouter ici des vérifications supplémentaires avant l'action
        OrderAction::updateStatus($order, $newStatus);

        // Notifications email selon le nouveau statut
        try {
            $order->loadMissing('user');
            if (!$order->user || !$order->user->email) {
                return;
            }

            if ($newStatus === OrderStatus::SHIPPING) {
                // Commande expédiée
                $this->mailService->sendMailable($order->user->email, new OrderShippedMail($order));
            } elseif ($newStatus === OrderStatus::DELIVERED) {
                // Commande livrée
                $dto = new MailDto(
                    to: $order->user->email,
                    subject: __('Your order :orderNumber has been delivered', ['orderNumber' => $order->order_number]),
                    template: 'templates.default',
                    data: [
                        'title' => __('Your order has been delivered'),
                        'content' => [
                            __('Good news! Your order :orderNumber has been delivered.', ['orderNumber' => $order->order_number]),
                            __('If you did not receive your package or if there is any issue, please contact our support team as soon as possible.'),
                        ],
                    ],
                );
                $this->mailService->queue($dto);
            }
        } catch (\Throwable $e) {
            Log::error('OrderService::updateStatus mail notification failed', [
                'order_id' => $order->id,
                'status' => $newStatus->value,
                'error' => $e->getMessage(),
            ]);
        }
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

        // Notification aux admins / managers : nouveau justificatif de paiement à vérifier
        try {
            MailHelper::notifyAdminsAndManagers(
                subject: __('Payment proof submitted for order :orderNumber', ['orderNumber' => $order->order_number]),
                content: [
                    __('A customer has submitted a payment proof. Please verify the payment.'),
                    'ID: #' . $order->id . ' – ' . ($order->user->email ?? 'guest'),
                    route('admin.orders.show', ['id' => $order->id]),
                ],
            );
        } catch (\Throwable $e) {
            Log::error('OrderService::processPaymentProof admin notification failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
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

        // Notification au client : paiement confirmé
        try {
            $order->loadMissing('user');
            if ($order->user && $order->user->email) {
                $dto = new MailDto(
                    to: $order->user->email,
                    subject: __('Payment confirmed for order :orderNumber', ['orderNumber' => $order->order_number]),
                    template: 'templates.default',
                    data: [
                        'title' => __('Your payment has been confirmed'),
                        'content' => [
                            __('We have successfully verified the payment for your order :orderNumber.', ['orderNumber' => $order->order_number]),
                            __('You can track the status of your order at any time using the tracking link below.'),
                        ],
                        'buttonText' => __('Track your order'),
                        'buttonUrl' => route('public.order-tracking.show', ['orderNumber' => $order->order_number]),
                    ],
                );

                $this->mailService->queue($dto);
            }
        } catch (\Throwable $e) {
            Log::error('OrderService::confirmPayment mail notification failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
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

        // Notification au client : commande annulée
        try {
            $order->loadMissing('user');
            if ($order->user && $order->user->email) {
                $dto = new MailDto(
                    to: $order->user->email,
                    subject: __('Your order :orderNumber has been cancelled', ['orderNumber' => $order->order_number]),
                    template: 'templates.default',
                    data: [
                        'title' => __('Your order has been cancelled'),
                        'content' => [
                            __('Your order :orderNumber has been cancelled.', ['orderNumber' => $order->order_number]),
                            __('If you think this is a mistake or if you have any question, please contact our support team.'),
                        ],
                    ],
                );

                $this->mailService->queue($dto);
            }
        } catch (\Throwable $e) {
            Log::error('OrderService::cancelOrder mail notification failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
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

    /**
     * Envoie la confirmation de commande au client.
     */
    private function sendOrderConfirmationMail(Order $order): void
    {
        try {
            $order->loadMissing('user');
            if (!$order->user || !$order->user->email) {
                return;
            }

            // Utilise le Mailable dédié, pour un meilleur template
            $this->mailService->sendMailable($order->user->email, new OrderConfirmationMail($order));
        } catch (\Throwable $e) {
            Log::error('OrderService::sendOrderConfirmationMail failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}