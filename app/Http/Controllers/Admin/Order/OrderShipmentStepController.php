<?php

namespace App\Http\Controllers\Admin\Order;

use App\Http\Controllers\Controller;
use App\Core\Ordering\Services\OrderShipmentStepService;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OrderShipmentStepController extends Controller
{
    public function __construct(
        protected OrderShipmentStepService $stepService
    ) {}

    /**
     * Affiche la page de gestion du suivi pour une commande spécifique.
     */
    public function index(int $orderId): Response
    {
        $order = Order::findOrFail($orderId);
        
        return Inertia::render('admin/orders/tracking/index', [
            'order' => $order,
            'steps' => $this->stepService->getFullRoute($orderId),
            'metrics' => $this->stepService->getProgressMetrics($orderId),
        ]);
    }

    /**
     * Initialise un itinéraire complet (stops) pour une commande.
     */
    public function store(Request $request, int $orderId)
    {
        $request->validate([
            'stops' => 'required|array|min:1',
            'stops.*.name' => 'required|string|max:255', // Changé: array -> string
            'stops.*.description' => 'nullable|string',   // Changé: array -> string
            'stops.*.lat' => 'nullable|numeric',
            'stops.*.lng' => 'nullable|numeric',
            'stops.*.estimated_arrival' => 'nullable|date',
        ]);

        try {
            $order = Order::findOrFail($orderId);
            $this->stepService->createCustomRoute($order, $request->stops);

            return back()->with('success', __('Shipment route initialized successfully.'));
        } catch (\Exception $e) {
            Log::error("Failed to initialize route for Order #{$orderId}: " . $e->getMessage());
            return back()->with('error', __('Failed to initialize shipment route.'));
        }
    }

    /**
     * Valide l'étape suivante dans la séquence.
     */
    public function advance(int $orderId)
    {
        try {
            $advanced = $this->stepService->advanceShipment($orderId);

            if ($advanced) {
                return back()->with('success', __('Shipment advanced to the next step.'));
            }

            return back()->with('info', __('All shipment steps have already been reached.'));
        } catch (\Exception $e) {
            Log::error("Failed to advance shipment for Order #{$orderId}: " . $e->getMessage());
            return back()->with('error', __('Failed to update shipment progress.'));
        }
    }

    /**
     * Met à jour les données d'une étape spécifique.
     */
    public function update(Request $request, int $stepId)
    {
        $validated = $request->validate([
            'position' => 'nullable|integer',
            'location_name' => 'nullable|string|max:255',   // Changé: array -> string
            'status_description' => 'nullable|string',    // Changé: array -> string
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_reached' => 'nullable|boolean',
            'reached_at' => 'nullable|date',
            'estimated_arrival' => 'nullable|date',
        ]);

        try {
            // Le service s'occupe de fusionner les données via le DTO
            $this->stepService->updateStep($stepId, $validated);
            
            return back()->with('success', __('Shipment step updated successfully.'));
        } catch (\Exception $e) {
            Log::error("Failed to update step #{$stepId}: " . $e->getMessage());
            return back()->with('error', __('Failed to update the shipment step.'));
        }
    }

    /**
     * Bascule l'état "reached" d'une étape.
     */
    public function toggle(int $order, int $step)
    {
        try {
            $this->stepService->toggleReached($step);
            return back()->with('success', __('Shipment step status updated successfully.'));
        } catch (\Exception $e) {
            Log::error("Failed to toggle step #{$step}: " . $e->getMessage());
            return back()->with('error', __('Failed to update the shipment step status.'));
        }
    }

    public function destroy(int $order, int $step)
    {
        Log::info('[OrderShipmentStepController::destroy] ENTRY', [
            'order_id_from_route' => $order,
            'step_id_from_route'   => $step,
            'request_path'        => request()->path(),
            'request_method'      => request()->method(),
        ]);

        try {
            $model = \App\Models\OrderShipmentStep::find($step);

            Log::info('[OrderShipmentStepController::destroy] AFTER find', [
                'step_id_queried' => $step,
                'model_found'     => $model !== null,
                'model_id'        => $model?->id,
                'model_order_id'  => $model?->order_id,
            ]);

            if (!$model) {
                Log::warning('[OrderShipmentStepController::destroy] Step not found in DB', [
                    'step_id' => $step,
                    'existing_steps_ids' => \App\Models\OrderShipmentStep::pluck('id')->toArray(),
                ]);
                return back()->with('error', __('The shipment step no longer exists.'));
            }

            $this->stepService->removeStep($step);
            Log::info('[OrderShipmentStepController::destroy] SUCCESS', ['step_id' => $step]);
            return back()->with('success', __('Shipment step removed successfully.'));
        } catch (\Exception $e) {
            Log::error('[OrderShipmentStepController::destroy] EXCEPTION', [
                'step_id' => $step,
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return back()->with('error', __('Failed to delete the shipment step.'));
        }
    }
}