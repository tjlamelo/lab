<?php

namespace App\Http\Controllers\Admin\Pricing;

use App\Core\Pricing\Dto\PaymentMethodDto;
use App\Core\Pricing\Services\PaymentMethodService;
use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

final class PaymentMethodController extends Controller
{
    public function __construct(
        protected PaymentMethodService $service,
    ) {}

    public function index(): Response
    {
        $methods = $this->service->getAllMethods();

        return Inertia::render('admin/pricing/payment-methods/index', [
            'methods' => $methods,
        ]);
    }

    public function show(int $id): Response
    {
        $method = $this->service->findById($id);

        return Inertia::render('admin/pricing/payment-methods/show', [
            'method' => $method,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:100',
            'instructions' => 'nullable|array',
            'payment_details' => 'nullable|array',
            'logo' => 'nullable|image|max:2048', // 2MB
        ]);

        DB::beginTransaction();

        try {
            $logoPath = null;
            if ($request->hasFile('logo')) {
                $logoPath = $request->file('logo')->store('payment-methods', 'public');
            }

            $dto = new PaymentMethodDto(
                id: 0,
                name: $validated['name'],
                slug: $validated['slug'] ?? '',
                instructions: $validated['instructions'] ?? null,
                paymentDetails: $validated['payment_details'] ?? null,
                logo: $logoPath,
                isActive: true,
            );

            $this->service->createMethod($dto);

            DB::commit();
            return back()->with('success', __('Payment method created successfully.'));
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('PaymentMethodController::store failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->with('error', __('Failed to create payment method.'));
        }
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:100',
            'instructions' => 'nullable|array',
            'payment_details' => 'nullable|array',
            'logo' => 'nullable|image|max:2048',
            'remove_logo' => 'sometimes|boolean',
            'is_active' => 'required|boolean',
        ]);

        DB::beginTransaction();

        try {
            /** @var PaymentMethod $method */
            $method = $this->service->findById($id);

            $logoPath = $method->logo;

            // Remove logo if requested
            if ($request->boolean('remove_logo') && $logoPath) {
                Storage::disk('public')->delete($logoPath);
                $logoPath = null;
            }

            // New logo upload
            if ($request->hasFile('logo')) {
                if ($logoPath) {
                    Storage::disk('public')->delete($logoPath);
                }
                $logoPath = $request->file('logo')->store('payment-methods', 'public');
            }

            $dto = new PaymentMethodDto(
                id: $method->id,
                name: $validated['name'],
                slug: $validated['slug'] ?? '',
                instructions: $validated['instructions'] ?? null,
                paymentDetails: $validated['payment_details'] ?? null,
                logo: $logoPath,
                isActive: (bool) $validated['is_active'],
            );

            $this->service->updateMethod($id, $dto);

            DB::commit();
            return back()->with('success', __('Payment method updated successfully.'));
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('PaymentMethodController::update failed', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', __('Failed to update payment method.'));
        }
    }

    public function toggle(int $id)
    {
        try {
            $this->service->toggleMethodStatus($id);
            return back()->with('success', __('Payment method status updated.'));
        } catch (\Throwable $e) {
            Log::error('PaymentMethodController::toggle failed', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', __('Failed to update payment method status.'));
        }
    }

    public function destroy(int $id)
    {
        try {
            $deleted = $this->service->deleteMethod($id);
            if ($deleted) {
                return back()->with('success', __('Payment method deleted successfully.'));
            }

            return back()->with('success', __('Payment method disabled because it is linked to existing orders.'));
        } catch (\Throwable $e) {
            Log::error('PaymentMethodController::destroy failed', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', __('Failed to delete payment method.'));
        }
    }
}

