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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // {"fr": "Crypto", "en": "Crypto"}
            $table->json('instructions')->nullable();
            $table->string('slug')->unique();
            $table->string('logo')->nullable();

            // Nouveau champ pour les coordonnées de réception des fonds
            // Exemple : {"address": "0x...", "network": "ERC20"} ou {"email": "pay@me.com"}
            $table->json('payment_details')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
