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

            // Nom du moyen de paiement : {"fr": "Virement", "en": "Bank Transfer"}
            $table->json('name');

            // Instructions détaillées : {"fr": "Envoyez le montant sur le RIB...", "en": "Send the amount to..."}
            $table->json('instructions')->nullable();

            // Identifiant unique (ex: 'crypto-btc', 'orange-money', 'virement')
            $table->string('slug')->unique();

            // Pour stocker une icône (ex: "crypto.svg")
            $table->string('logo')->nullable();

            // Statut : permet de désactiver un moyen de paiement sans le supprimer
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
