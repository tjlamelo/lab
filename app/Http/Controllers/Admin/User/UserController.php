<?php

namespace App\Http\Controllers\Admin\User;

use App\Http\Controllers\Controller;
use App\Core\User\Services\UserService;
use App\Core\User\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService,
        protected PermissionService $permissionService
    ) {}

    /**
     * Liste des utilisateurs avec recherche et pagination.
     */
    public function index(Request $request): Response
    {
        $users = $this->userService->getAllPaginated(
            perPage: 15,
            search: $request->query('search')
        );

        return Inertia::render('admin/user/index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Formulaire d'édition des accès.
     */
public function edit(int $id): Response
    {
        $user = $this->userService->findById($id);
        
        // On charge les rôles avec leurs permissions pour la logique auto-check en React
        $availableRoles = Role::with('permissions')->get();

        return Inertia::render('admin/user/edit', [
            'user' => [
                'id'          => $user->id,
                'name'        => $user->name,
                'roles'       => $user->roles->pluck('name'),
                // getAllPermissions() inclut les permissions héritées des rôles
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
            'availableRoles'       => $availableRoles,
            'availablePermissions' => $this->permissionService->getAllAvailablePermissions(),
        ]);
    }

    /**
     * Mise à jour des accès (rôles et permissions).
     */
    public function updateAccess(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'roles'       => 'array',
            'permissions' => 'array',
        ]);

        $this->permissionService->updateUserAccess(
            $id,
            $request->input('roles', []),
            $request->input('permissions', [])
        );

        return redirect()->back()->with('success', 'Access rights updated successfully.');
    }

    /**
     * Activation / Désactivation du compte.
     */
    public function toggleStatus(int $id): RedirectResponse
    {
        $this->userService->toggleStatus($id);
        return redirect()->back()->with('success', 'User status has been modified.');
    }

    /**
     * Suppression de l'utilisateur.
     */
    public function destroy(int $id): RedirectResponse
    {
        $this->userService->delete($id);
        return redirect()->route('admin.users.index')->with('success', 'User deleted.');
    }
}