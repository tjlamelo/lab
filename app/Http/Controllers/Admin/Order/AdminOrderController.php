<?php

namespace App\Http\Controllers\Admin\Order;

use App\Core\Ordering\Actions\OrderAction;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Core\Ordering\Services\OrderService;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;

class AdminOrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {
    }

    /**
     * Liste des commandes avec filtrage et recherche.
     */
    /**
     * Liste des commandes avec filtrage et recherche.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'payment_status', 'date']);

        return Inertia::render('admin/orders/index', [
            'orders' => $this->orderService->listOrders($filters),
            'filters' => $filters,
            'config' => [
                // On envoie les options formatées {value, label} pour le Select
                'statuses' => OrderStatus::getOptions(),
                'payment_statuses' => PaymentStatus::getOptions(),
            ]
        ]);
    }

    /**
     * Affiche les détails d'une commande spécifique (incluant la preuve de paiement)
     */
    public function show($id)
    {
        $order = Order::with([
            'items.product',
            'paymentMethod',
            'user',
            'shippingSteps',
        ])->findOrFail($id);

        return Inertia::render('admin/orders/show', [
            'order' => $order,
            'config' => [
                'payment_statuses' => PaymentStatus::getOptions(),
                'statuses' => OrderStatus::getOptions()
            ]
        ]);
    }

    /**
     * Valider manuellement un paiement après vérification de la capture
     */
    public function confirmPayment($id)
    {
        $order = Order::findOrFail($id);

        try {
            $this->orderService->confirmPayment($order);
            return back()->with('success', __('Payment confirmed successfully.'));
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }


    public function updateStatus(Request $request, $id)
    {
        Log::info('AdminOrderController::updateStatus start', ['order_id' => $id, 'status' => $request->input('status')]);

        $request->validate([
            'status' => ['required', new Enum(OrderStatus::class)]
        ]);
        Log::info('AdminOrderController::updateStatus validation ok', ['order_id' => $id]);

        $order = Order::findOrFail($id);
        Log::info('AdminOrderController::updateStatus order loaded', ['order_id' => $id]);

        try {
            $this->orderService->updateStatus($order, OrderStatus::from($request->status));
            Log::info('AdminOrderController::updateStatus service done, redirecting', ['order_id' => $id]);
            // 303 is the correct redirect after a non-GET (PATCH/POST),
            // and avoids some HTTP/2 proxy/CDN issues with 302 after PATCH.
            return redirect()
                ->route('admin.orders.show', $id)
                ->setStatusCode(303)
                ->with('success', __('Status updated.'));
        } catch (\Throwable $e) {
            Log::error('AdminOrderController::updateStatus exception', [
                'order_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            report($e);
            return redirect()
                ->route('admin.orders.show', $id)
                ->setStatusCode(303)
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function updatePaymentStatus(Request $request, $id)
    {
        Log::info('AdminOrderController::updatePaymentStatus start', ['order_id' => $id, 'payment_status' => $request->input('payment_status')]);

        $request->validate([
            'payment_status' => ['required', new Enum(PaymentStatus::class)]
        ]);
        $order = Order::findOrFail($id);

        try {
            $this->orderService->updatePaymentStatus($order, PaymentStatus::from($request->payment_status));
            Log::info('AdminOrderController::updatePaymentStatus service done, redirecting', ['order_id' => $id]);
            return redirect()
                ->route('admin.orders.show', $id)
                ->setStatusCode(303)
                ->with('success', __('Payment status updated.'));
        } catch (\Throwable $e) {
            Log::error('AdminOrderController::updatePaymentStatus exception', [
                'order_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            report($e);
            return redirect()
                ->route('admin.orders.show', $id)
                ->setStatusCode(303)
                ->withErrors(['error' => $e->getMessage()]);
        }
    }
}