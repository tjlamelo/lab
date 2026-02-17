<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mail_settings', function (Blueprint $table) {
            $table->id();

            $table->string('company_name')->nullable();
            $table->string('website_url')->nullable();
            $table->string('support_email')->nullable();

            // Branding (hex colors + public path)
            $table->string('brand_primary', 32)->nullable();   // ex: #5B21B6
            $table->string('brand_secondary', 32)->nullable(); // ex: #7C3AED
            $table->string('background_color', 32)->nullable(); // ex: #F4F4F4
            $table->string('logo_path')->nullable(); // ex: img/logo.png

            // Footer / legal
            $table->text('footer_note')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mail_settings');
    }
};

