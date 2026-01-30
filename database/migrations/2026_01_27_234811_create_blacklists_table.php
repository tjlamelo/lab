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
        Schema::create('blacklists', function (Blueprint $table) {
            $table->id();

            // L'identifiant banni (soit l'email, soit l'ID du fingerprint)
            $table->string('identifier')->unique()->index();

            // Le type de blocage pour faciliter la gestion en admin
            // Valeurs possibles : 'email', 'fingerprint', 'ip'
            $table->string('type');

            // Pourquoi cet utilisateur a été banni (utile pour l'admin)
            $table->text('reason')->nullable();

            // Pour des blocages temporaires (optionnel)
            $table->timestamp('expires_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blacklists');
    }
};
