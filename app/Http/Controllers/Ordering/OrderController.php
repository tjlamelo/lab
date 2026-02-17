<?php

namespace App\Http\Controllers\Ordering;

use App\Http\Controllers\Controller;
use App\Core\Ordering\Services\CartCacheService;
use App\Core\Ordering\Services\OrderService;
use App\Core\Ordering\Dto\OrderDto;
use App\Http\Requests\Ordering\StoreOrderRequest;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(
        private readonly CartCacheService $cartService,
        private readonly OrderService $orderService
    ) {
    }

    /**
     * Affiche la vue de checkout avec les produits et le total.
     * Nécessite une authentification.
     */
    public function checkout()
    {
        // Vérifier que l'utilisateur est authentifié (déjà géré par le middleware auth, mais double vérification)
        if (!auth()->check()) {
            return redirect()->route('login')->with('error', __('You must be logged in to proceed to checkout.'));
        }

        $cartData = $this->cartService->getCart(auth()->id());

        // Si le panier est vide, on redirige vers le panier ou l'accueil
        if ($cartData['count'] === 0) {
            return redirect()->route('cart.index')->with('error', __('Your cart is empty.'));
        }

        return Inertia::render('shop/checkout/index', [
            'cart' => $cartData,
            'auth_user' => auth()->user(),
            // On peut passer les méthodes de paiement disponibles ici
            'payment_methods' => \App\Models\PaymentMethod::where('is_active', true)->get(),
        ]);
    }

    /**
     * Traite la soumission du formulaire de commande.
     */
    // app/Http/Controllers/Ordering/OrderController.php

    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();

        // 1. Gérer le fichier
        if ($request->hasFile('payment_proof')) {
            $path = $request->file('payment_proof')->store('proofs', 'public');
            $validated['payment_proof'] = $path;
        }

        $cartData = $this->cartService->getCart(auth()->id());

        // 2. Préparer les items (ton code existant est bon)
        $items = collect($cartData['items'])->map(function ($item) {
            $itemArray = (array) $item;
            return [
                'product_id' => $itemArray['productId'] ?? $itemArray['product_id'],
                'quantity' => $itemArray['quantity'],
                'price' => $itemArray['price'],
                'product_name' => $itemArray['productNameAtPurchase'] ?? 'Produit',
            ];
        })->toArray();

        $orderData = array_merge($validated, [
            'items' => $items,
            'total_amount' => $cartData['total'],
        ]);

        try {
            $dto = OrderDto::fromRequest(auth()->id(), $orderData);
            $order = $this->orderService->placeOrder($dto);

            // Une fois la commande placée, on peut changer le status de paiement
            // car la preuve est déjà fournie à la création.
            $order->update(['payment_status' => 'waiting_verification']);

            $this->cartService->emptyCart(auth()->id());

            return redirect()->route('orders.show', $order->id)
                ->with('success', 'Paiement reçu, en cours de vérification.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}