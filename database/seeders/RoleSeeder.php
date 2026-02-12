<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Définition des rôles
        $roles = [
            'admin'    => 'Full access to everything',
            'manager'  => 'Manage shop, products and orders',
            'editor'   => 'Manage catalog content',
            'customer' => 'Standard shopping access'
        ];

        foreach ($roles as $name => $description) {
            Role::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        // 2. Attribution des permissions aux rôles
        
        // --- ADMIN : Tout recevoir ---
        $admin = Role::findByName('admin');
        $admin->givePermissionTo(Permission::all());

        // --- MANAGER : Catalogue + Commandes + View Users ---
        $manager = Role::findByName('manager');
        $manager->givePermissionTo([
            'view users',
            'view products', 'create products', 'edit products', 'publish products',
            'view categories', 'create categories', 'edit categories', 'publish categories',
            'view orders', 'edit orders', 'update-status orders',
        ]);

        // --- EDITOR : Catalogue uniquement ---
        $editor = Role::findByName('editor');
        $editor->givePermissionTo([
            'view products', 'edit products',
            'view categories', 'edit categories',
        ]);

        // --- CUSTOMER : Accès minimal (View Only sur catalogue) ---
        $customer = Role::findByName('customer');
        $customer->givePermissionTo([
            'view products',
            'view categories',
        ]);
    }
}