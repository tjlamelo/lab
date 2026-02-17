<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar; 
class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        // 1. Création des comptes "Staff" pour tester les accès
        $staff = [
            [
                'name' => 'Admin PrimeLab',
                'email' => 'admin@primelabchemicals.com',
                'role' => 'admin'
            ],
            [
                'name' => 'Manager PrimeLab',
                'email' => 'manager@primelabchemicals.com',
                'role' => 'manager'
            ],
            [
                'name' => 'Editor PrimeLab',
                'email' => 'editor@primelabchemicals.com',
                'role' => 'editor'
            ],
        ];

        foreach ($staff as $member) {
            $user = User::firstOrCreate(
                ['email' => $member['email']],
                [
                    'name' => $member['name'],
                    'password' => Hash::make('password'),
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
            $user->assignRole($member['role']);
        }

        // 2. Création de clients (Rôle par défaut : customer)
        // On crée 50 clients via la factory
        // User::factory(50)->create([
        //     'is_active' => true,
        // ])->each(function ($user) {
        //     $user->assignRole('customer');
        // });

        // 3. Création de quelques clients inactifs pour tes tests d'interface
        // User::factory(5)->create([
        //     'name' => 'Client Inactif',
        //     'is_active' => false,
        // ])->each(function ($user) {
        //     $user->assignRole('customer');
        // });
    }
}