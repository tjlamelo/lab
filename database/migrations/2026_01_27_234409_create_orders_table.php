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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // Identification
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('order_number')->unique(); // Ex: CMD-2026-X89Z

            // Paiement
            $table->foreignId('payment_method_id')->constrained();
            $table->string('payment_status')->default('pending'); // pending, waiting_verification, paid, failed
            $table->string('payment_proof')->nullable(); // Chemin vers le fichier (image/pdf)
            $table->timestamp('payment_verified_at')->nullable(); // Date de validation par l'admin

            // Montant total
            $table->decimal('total_amount', 10, 2);

            // Statut de la commande (Flux logistique)
            $table->string('status')->default('waiting_payment');
            // waiting_payment, processing, shipping, delivered, cancelled

            // Informations de livraison "gelées" (Copie de l'adresse au moment de l'achat)
            $table->json('shipping_address');

            // Notes internes ou client
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
