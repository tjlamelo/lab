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
        Schema::create('order_shipment_steps', function (Blueprint $table) {
            $table->id();

            // Relation avec la commande
            $table->foreignId('order_id')->constrained()->onDelete('cascade');

            // Ordre de l'étape dans le parcours (1, 2, 3...)
            $table->integer('position')->default(1);

            // Informations sur le lieu (ex: {"fr": "Port de Douala", "en": "Douala Port"})
            $table->json('location_name');

            // Détails du statut (ex: {"fr": "En attente de dédouanement", "en": "Waiting for customs"})
            $table->json('status_description')->nullable();

            // Géolocalisation pour l'affichage sur une carte (React Leaflet / Google Maps)
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Gestion du passage
            $table->boolean('is_reached')->default(false); // Est-ce que le colis est passé par ici ?
            $table->timestamp('reached_at')->nullable(); // Heure réelle du passage
            $table->timestamp('estimated_arrival')->nullable(); // Heure de passage prévue

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_shipment_steps');
    }
};
