<?php

namespace App\Core\Ordering\Actions;

use App\Models\Order;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Core\Ordering\Dto\OrderDto;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class OrderAction
{
    /**
     * Create the order header atomically.
     */
    public static function create(OrderDto $dto): Order
    {
        return DB::transaction(function () use ($dto) {
            return Order::create([
                'user_id'           => $dto->userId,
                'payment_method_id' => $dto->paymentMethodId,
                'total_amount'      => $dto->totalAmount,
                'shipping_address'  => $dto->shippingAddress,
                'notes'             => $dto->notes,
                'payment_proof'     => $dto->paymentProof,
                'status'            => OrderStatus::WAITING_PAYMENT,
                'payment_status'    => PaymentStatus::PENDING,
            ]);
        });
    }

    /**
     * Update payment proof with locking to prevent conflicts.
     */
    public static function submitPaymentProof(Order $order, string $path): void
    {
        DB::transaction(function () use ($order, $path) {
            $order->refresh()->lockForUpdate();

            if ($order->payment_status === PaymentStatus::PAID) {
                throw ValidationException::withMessages([
                    'payment_proof' => __('This order has already been paid.')
                ]);
            }

            if ($order->status === OrderStatus::CANCELLED) {
                throw ValidationException::withMessages([
                    'payment_proof' => __('Cannot submit payment proof for a cancelled order.')
                ]);
            }

            $order->update([
                'payment_proof' => $path,
                'payment_status' => PaymentStatus::WAITING_VERIFICATION
            ]);
        });
    }

    /**
     * Validates payment and advances the workflow.
     */
    public static function verifyPayment(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->refresh()->lockForUpdate();

            if ($order->payment_status === PaymentStatus::PAID) {
                throw ValidationException::withMessages([
                    'payment_status' => __('Payment has already been verified for this order.')
                ]);
            }

            $order->update([
                'payment_status'      => PaymentStatus::PAID,
                'payment_verified_at' => now(),
                'status'              => $order->status === OrderStatus::WAITING_PAYMENT 
                                         ? OrderStatus::PROCESSING 
                                         : $order->status
            ]);
        });
    }

    /**
     * Secured logistic status update.
     */
    public static function updateStatus(Order $order, OrderStatus $newStatus): void
    {
        DB::transaction(function () use ($order, $newStatus) {
            $order->refresh()->lockForUpdate();

            // if ($order->status === OrderStatus::CANCELLED) {
            //     throw ValidationException::withMessages([
            //         'status' => __('Cannot update the status of a cancelled order.')
            //     ]);
            // }

            if (in_array($newStatus, [OrderStatus::SHIPPING, OrderStatus::DELIVERED]) 
                && $order->payment_status !== PaymentStatus::PAID) {
                throw ValidationException::withMessages([
                    'status' => __('Cannot ship or deliver an order that has not been paid.')
                ]);
            }

            $order->update(['status' => $newStatus]);
        });
    }

    /**
     * Manually update payment status.
     */
    public static function updatePaymentStatus(Order $order, PaymentStatus $newStatus): void
    {
        DB::transaction(function () use ($order, $newStatus) {
            $order->refresh()->lockForUpdate();

            $updateData = ['payment_status' => $newStatus];

            if ($newStatus === PaymentStatus::PAID) {
                $updateData['payment_verified_at'] = now();
                
                if ($order->status === OrderStatus::WAITING_PAYMENT) {
                    $updateData['status'] = OrderStatus::PROCESSING;
                }
            }

            $order->update($updateData);
        });
    }

    /**
     * Cancels the order and fails the payment properly.
     */
    public static function cancel(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->refresh()->lockForUpdate();

            if ($order->status === OrderStatus::DELIVERED) {
                throw ValidationException::withMessages([
                    'order' => __('Cannot cancel an order that has already been delivered.')
                ]);
            }

            $order->update([
                'status' => OrderStatus::CANCELLED,
                'payment_status' => $order->payment_status === PaymentStatus::PAID 
                                    ? PaymentStatus::REFUNDED 
                                    : PaymentStatus::FAILED
            ]);
        });
    }
}