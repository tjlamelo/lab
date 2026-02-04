<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Empreinte et identification
            $table->string('fingerprint')->index();
            $table->string('device_type')->nullable(); // mobile, desktop, tablet
            $table->string('os_family')->nullable();   // iOS, Windows, Android
            $table->string('browser_family')->nullable(); // Chrome, Safari

            // Sécurité et Abus
            $table->ipAddress('last_ip')->nullable();
            $table->boolean('is_trusted')->default(false); // Passe à true après double authentification
            $table->integer('login_count')->default(1);
            $table->timestamp('last_active_at')->useCurrent();

            $table->timestamps();

            // Index composite pour des recherches ultra-rapides
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
