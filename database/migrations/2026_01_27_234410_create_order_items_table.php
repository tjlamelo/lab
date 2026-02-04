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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            // Relation avec la commande parente
            $table->foreignId('order_id')->constrained()->onDelete('cascade');

            // Relation avec le produit
            // On utilise nullOnDelete ou restrict pour garder une trace si le produit est supprimé
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');

            // Données figées au moment de l'achat
            $table->integer('quantity');

            // TRÈS IMPORTANT : On stocke le prix auquel le client a payé.
            // Si le prix du produit change demain, la facture du client reste exacte.
            $table->decimal('price', 10, 2);

            // Optionnel : stocker le nom du produit en JSON au cas où le produit original est supprimé
            $table->json('product_name_at_purchase')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
