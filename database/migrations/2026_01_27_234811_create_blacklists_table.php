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

            // On stocke la valeur bannie (IP, Email ou Fingerprint)
            $table->string('identifier')->index();

            // Type : 1=Email, 2=Fingerprint, 3=IP, 4=Phone
            $table->unsignedTinyInteger('type')->index();

            $table->text('reason')->nullable();
            $table->json('metadata')->nullable(); // Pour stocker des preuves (ex: logs de l'attaque)

            $table->timestamp('expires_at')->nullable()->index(); // Pour les bans temporaires
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
