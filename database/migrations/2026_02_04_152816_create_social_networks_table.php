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
      Schema::create('social_networks', function (Blueprint $table) {
            $table->id();
            
            // Le nom du réseau (facebook, telegram, whatsapp, x, etc.)
            $table->string('platform')->index(); 
            
            // Le lien complet ou le numéro (ex: https://t.me/username ou +336...)
            $table->text('url'); 
            
            // Optionnel : Pour trier l'affichage
            $table->integer('order')->default(0);
            
            // Optionnel : Pour activer/désactiver sans supprimer
            $table->boolean('is_active')->default(true);
 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_networks');
    }
};
