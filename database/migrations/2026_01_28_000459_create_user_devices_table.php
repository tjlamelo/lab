<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
          Schema::create('user_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // L'empreinte unique du navigateur/appareil
            $table->string('fingerprint')->index();

            // Informations lisibles pour l'utilisateur (ex: "Chrome sur Windows 11")
            $table->string('device_name')->nullable();
            $table->string('browser')->nullable();
            $table->string('platform')->nullable(); // Windows, iOS, Android

            // Localisation approximative
            $table->string('last_ip')->nullable();

            // Statut de l'appareil
            $table->boolean('is_trusted')->default(true);
            $table->timestamp('last_active_at')->nullable();

            $table->timestamps();

            // Un utilisateur ne doit pas avoir deux fois le même fingerprint enregistré
            $table->unique(['user_id', 'fingerprint']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_devices');
    }
};
