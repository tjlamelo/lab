<?php

namespace App\Http\Controllers\Admin\User;

use App\Core\Security\Services\UserDeviceService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class UserDeviceController extends Controller
{
    public function __construct(
        protected UserDeviceService $service
    ) {}

    public function index(int $id): Response
    {
        $user = User::findOrFail($id);
        $devices = $this->service->listByUser($id);

        return Inertia::render('admin/user/devices/index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'devices' => $devices,
        ]);
    }

    public function toggleTrusted(Request $request, int $deviceId)
    {
        $this->service->toggleTrusted($deviceId);
        return back()->with('success', __('Device trust updated.'));
    }

    public function destroy(Request $request, int $deviceId)
    {
        $this->service->delete($deviceId);
        return back()->with('success', __('Device deleted.'));
    }
}

