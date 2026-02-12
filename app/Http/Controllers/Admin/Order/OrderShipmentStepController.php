<?php

namespace App\Http\Controllers\Admin\Order;

use App\Http\Controllers\Controller;
use App\Core\Ordering\Services\OrderShipmentStepService;
use App\Models\Order;
use App\Models\OrderShipmentStep;
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
     * Display the tracking management page for a specific order.
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
     * Initialize a default route or a custom set of stops for an order.
     */
    public function store(Request $request, int $orderId)
    {
        $request->validate([
            'stops' => 'required|array|min:1',
            'stops.*.name' => 'required|array', // Multi-lang JSON
            'stops.*.description' => 'nullable|array',
            'stops.*.lat' => 'nullable|numeric',
            'stops.*.lng' => 'nullable|numeric',
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
     * Mark the next pending step as reached.
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
     * Update a specific shipment step's data.
     */
    public function update(Request $request, int $stepId)
    {
        $validated = $request->validate([
            'location_name' => 'nullable|array',
            'status_description' => 'nullable|array',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_reached' => 'nullable|boolean',
            'estimated_arrival' => 'nullable|date',
        ]);

        try {
            $this->stepService->updateStep($stepId, $validated);
            return back()->with('success', __('Shipment step updated successfully.'));
        } catch (\Exception $e) {
            Log::error("Failed to update step #{$stepId}: " . $e->getMessage());
            return back()->with('error', __('Failed to update the shipment step.'));
        }
    }

    /**
     * Remove a step from the shipment journey.
     */
    public function destroy(int $stepId)
    {
        try {
            $this->stepService->removeStep($stepId);
            return back()->with('success', __('Shipment step removed successfully.'));
        } catch (\Exception $e) {
            Log::error("Failed to delete step #{$stepId}: " . $e->getMessage());
            return back()->with('error', __('Failed to delete the shipment step.'));
        }
    }
}