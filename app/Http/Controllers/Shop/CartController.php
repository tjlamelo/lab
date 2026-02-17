<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Core\Ordering\Dto\OrderItemDto;
use App\Core\Ordering\Services\CartCacheService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log; // Import important

class CartController extends Controller
{
    public function __construct(
        private readonly CartCacheService $cartService
    ) {}

    private function cartOwnerId(Request $request): int|string
    {
        // Utilise l'ID utilisateur si connecté, sinon l'ID de session pour les invités
        return $request->user()?->id ?? $request->session()->getId();
    }

    public function index(Request $request): Response
    {
        $cartData = $this->cartService->getCart($this->cartOwnerId($request));

        // LOG : Voir ce que le serveur renvoie au composant Index.tsx
        Log::info('🛒 Chargement du Panier Inertia', ['data' => $cartData]);

        return Inertia::render('shop/cart/index', [
            'cart' => $cartData
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // LOG : Voir ce que le bouton "Ajouter au panier" envoie réellement
        Log::debug('📥 Requête ajout panier reçue', $request->all());

        $validated = $request->validate([
            'product_id'   => 'required|integer',
            'quantity'     => 'required|numeric|min:0.1', // Changé en numeric pour le support du KG (0.5)
            'price'        => 'required|numeric',
            'product_name' => 'required|string',
            'product_image'=> 'nullable|string',
            'unit'         => 'nullable|string',
        ]);

        $dto = OrderItemDto::fromArray($validated);
        
        // LOG : Vérifier que le DTO a bien mappé les champs
        Log::debug('📦 DTO créé pour le panier', $dto->jsonSerialize());

        $this->cartService->addItem($this->cartOwnerId($request), $dto);

        return back()->with('success', __('Item added to cart.'));
    }

    public function update(Request $request, int $productId): RedirectResponse
    {
        // LOG : Utile pour débugger les problèmes de décimaux (ex: 0.5 kg)
        Log::debug("🔄 Mise à jour quantité produit $productId", ['qty' => $request->quantity]);

        $request->validate([
            'quantity' => 'required|numeric|min:0'
        ]);

        $this->cartService->setItemQuantity(
            $this->cartOwnerId($request),
            $productId,
            (float) $request->get('quantity')
        );

        return back()->with('success', __('Cart updated.'));
    }

    public function destroy(Request $request, int $productId): RedirectResponse
    {
        $this->cartService->removeItem($this->cartOwnerId($request), $productId);
        return back()->with('success', __('Item removed.'));
    }

    public function clear(Request $request): RedirectResponse
    {
        $this->cartService->emptyCart($this->cartOwnerId($request));
        return back()->with('success', __('Cart cleared.'));
    }
}