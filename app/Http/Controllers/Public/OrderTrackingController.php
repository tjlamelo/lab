<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Core\Ordering\Services\OrderShipmentStepService;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderTrackingController extends Controller
{
    public function __construct(
        protected OrderShipmentStepService $stepService
    ) {}

    /**
     * Affiche la page de recherche de commande.
     * Si un utilisateur est connecté, on précharge ses dernières commandes.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $myOrders = [];
        if ($user) {
            $orders = Order::query()
                ->where('user_id', $user->id)
                ->orderByDesc('created_at')
                ->limit(10)
                ->get();

            $myOrders = $orders->map(function (Order $order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status?->value,
                    'status_label' => $order->status?->label(),
                    'payment_status' => $order->payment_status?->value,
                    'payment_status_label' => $order->payment_status?->label(),
                    'total_amount' => $order->total_amount,
                    'created_at' => $order->created_at?->toISOString(),
                ];
            });
        }

        return Inertia::render('public/order-tracking/index', [
            'myOrders' => $myOrders,
        ]);
    }

    /**
     * Recherche et affiche les détails d'une commande par son numéro.
     */
    public function show(Request $request, string $orderNumber): Response
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['items.product', 'paymentMethod', 'shippingSteps' => function($query) {
                $query->orderBy('position', 'asc');
            }])
            ->first();

        if (!$order) {
            return Inertia::render('public/order-tracking/index', [
                'error' => __('Order not found. Please check your order number.'),
                'orderNumber' => $orderNumber
            ]);
        }

        // Récupérer les métriques de progression
        $metrics = $this->stepService->getProgressMetrics($order->id);

        // Préparer les données pour la vue
        $orderData = [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'payment_status' => $order->payment_status->value,
            'payment_status_label' => $order->payment_status->label(),
            'total_amount' => $order->total_amount,
            'shipping_address' => $order->shipping_address,
            'notes' => $order->notes,
            'created_at' => $order->created_at->toISOString(),
            'payment_verified_at' => $order->payment_verified_at?->toISOString(),
            'payment_method' => $order->paymentMethod ? [
                'id' => $order->paymentMethod->id,
                'name' => $order->paymentMethod->name,
                'description' => $order->paymentMethod->description,
            ] : null,
            'items' => $order->items->map(function ($item) use ($request) {
                // Récupérer la locale depuis la requête
                $locale = app()->getLocale();
                
                // Fonction helper pour extraire une valeur traduite
                $getTranslatedValue = function ($value, $fallback = null) use ($locale) {
                    if (is_array($value)) {
                        return $value[$locale] ?? $value['en'] ?? ($fallback ?? (is_array($value) ? reset($value) : $value));
                    }
                    return $value ?? $fallback;
                };
                
                // Extraire le nom du produit (peut être un objet de traductions)
                $productName = null;
                if ($item->product) {
                    $productName = $getTranslatedValue($item->product->name, __('Product deleted'));
                } else {
                    // Si le produit a été supprimé, utiliser le nom stocké
                    $storedName = $item->product_name_at_purchase;
                    if (is_array($storedName)) {
                        $productName = $getTranslatedValue($storedName['name'] ?? $storedName, __('Product deleted'));
                    } else {
                        $productName = $storedName ?? __('Product deleted');
                    }
                }
                
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $productName,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'unit_at_purchase' => $item->unit_at_purchase,
                    'subtotal' => $item->quantity * $item->price,
                ];
            }),
            'shipping_steps' => $order->shippingSteps->map(function ($step) {
                return [
                    'id' => $step->id,
                    'position' => $step->position,
                    'location_name' => $step->location_name,
                    'status_description' => $step->status_description,
                    'is_reached' => $step->is_reached,
                    'reached_at' => $step->reached_at?->toISOString(),
                    'estimated_arrival' => $step->estimated_arrival?->toISOString(),
                    'latitude' => $step->latitude,
                    'longitude' => $step->longitude,
                ];
            }),
        ];

        return Inertia::render('public/order-tracking/show', [
            'order' => $orderData,
            'metrics' => $metrics,
        ]);
    }

    /**
     * Recherche une commande via POST (formulaire).
     */
    public function search(Request $request)
    {
        $request->validate([
            'order_number' => 'required|string|max:255',
        ]);

        return redirect()->route('public.order-tracking.show', [
            'orderNumber' => $request->order_number
        ]);
    }
}
