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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();

            // Nom de la catégorie en JSON : {"fr": "Électronique", "en": "Electronics"}
            $table->json('name');

            // Slug unique pour l'URL (ex: mon-site.com/categories/electronique)
            $table->string('slug')->unique();

            // Optionnel : Description en JSON si besoin
            $table->json('description')->nullable();

            // Optionnel : Pour organiser les catégories en parent/enfant (ex: Informatique > PC Portables)
            $table->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('cascade');

            // Icône ou image de la catégorie
            $table->string('image')->nullable();

            // Pour activer/désactiver une catégorie entière facilement
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
