<?php

namespace App\Http\Controllers\Admin\Security;

use App\Core\Security\Services\BlacklistService;
use App\Core\Security\Services\UserDeviceService;
use App\Http\Controllers\Controller;
use App\Models\Blacklist;
use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class BlacklistController extends Controller
{
    public function __construct(
        protected BlacklistService $service,
        protected UserDeviceService $deviceService,
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'type', 'active', 'user_id', 'device_search', 'users_page']);

        $selectedUser = null;
        $selectedUserDevices = [];

        $userId = $request->integer('user_id');
        if ($userId) {
            $user = User::query()->select(['id', 'name', 'email'])->find($userId);
            if ($user) {
                $selectedUser = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ];
                $selectedUserDevices = $this->deviceService->listByUser($userId);
            }
        }

        $deviceSearch = trim((string) ($filters['device_search'] ?? ''));

        // Pagination par UTILISATEUR (plus logique qu'une pagination par device)
        $usersQuery = User::query()
            ->select(['id', 'name', 'email', 'phone'])
            ->whereHas('devices')
            ->with(['devices' => function ($q) {
                $q->orderByDesc('last_active_at');
            }])
            ->orderByDesc('id');

        if ($deviceSearch !== '') {
            $usersQuery->where(function ($q) use ($deviceSearch) {
                $q->where('name', 'like', "%{$deviceSearch}%")
                    ->orWhere('email', 'like', "%{$deviceSearch}%")
                    ->orWhereHas('devices', function ($dq) use ($deviceSearch) {
                        $dq->where('fingerprint', 'like', "%{$deviceSearch}%")
                            ->orWhere('last_ip', 'like', "%{$deviceSearch}%");
                    });
            });
        }

        return Inertia::render('admin/security/blacklist/index', [
            'bans' => $this->service->list($filters, perPage: 20),
            'filters' => $filters,
            'typeOptions' => collect(Blacklist::typeLabels())->map(fn ($label, $value) => [
                'value' => (int) $value,
                'label' => $label,
            ])->values(),
            'selectedUser' => $selectedUser,
            'selectedUserDevices' => $selectedUserDevices,
            'usersWithDevices' => $usersQuery->paginate(10, ['*'], 'users_page')->withQueryString(),
            'deviceFilters' => [
                'device_search' => $deviceSearch,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'identifier' => 'required|string|max:255',
            'type' => 'required|integer|in:1,2,3,4',
            'reason' => 'nullable|string|max:1000',
            'expires_at' => 'nullable|date',
        ]);

        $this->service->create([
            'identifier' => $validated['identifier'],
            'type' => (int) $validated['type'],
            'reason' => $validated['reason'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'metadata' => [
                'created_by' => $request->user()?->id,
                'ip' => $request->ip(),
            ],
        ]);

        return back()->with('success', __('Added to blacklist.'));
    }

    public function destroy(int $id)
    {
        $this->service->remove($id);
        return back()->with('success', __('Removed from blacklist.'));
    }

    public function blockUser(Request $request, int $user): mixed
    {
        $u = User::query()->with('devices')->findOrFail($user);

        $this->service->blockUserCompletely($u, metadata: [
            'created_by' => $request->user()?->id,
            'ip' => $request->ip(),
        ], reason: 'Blocked user completely');

        return back()->with('success', __('User blocked.'));
    }
}

