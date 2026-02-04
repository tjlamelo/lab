<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Réinitialiser le cache des permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Définition des permissions par modules
        $modules = [
            'users' => ['view', 'create', 'edit', 'delete'],
            'roles' => ['view', 'create', 'edit', 'delete'],
            'products' => ['view', 'create', 'edit', 'delete', 'publish'],
            'categories' => ['view', 'create', 'edit', 'delete', 'publish'],
            'orders' => ['view', 'edit', 'update-status'],
            'settings' => ['view', 'edit'],
        ];

        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                // Format: "action module" (ex: "create products")
                Permission::firstOrCreate([
                    'name' => "{$action} {$module}",
                    'guard_name' => 'web'
                ]);
            }
        }
    }
}