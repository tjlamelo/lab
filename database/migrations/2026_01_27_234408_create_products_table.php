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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');

            $table->json('name');
            $table->json('description')->nullable();
            $table->json('meta')->nullable(); // Nouveau champ : SEO, Spécifications, etc.

            $table->string('slug')->unique();
            $table->string('sku')->unique()->nullable();
            $table->decimal('price', 10, 2);
       $table->string('unit')->nullable();
            $table->string('purity')->default('99.9%');
            $table->integer('stock')->default(0);
            $table->json('images')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
