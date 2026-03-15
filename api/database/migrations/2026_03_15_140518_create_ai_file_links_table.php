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
        Schema::create('ai_file_links', function (Blueprint $table) {
            $table->id();

            $table->foreignId('file_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('provider')->index();

            // у провайдерів це зазвичай string id, а не integer
            $table->string('provider_file_id')->nullable()->index();
            $table->string('provider_store_id')->nullable()->index();
            $table->string('provider_store_document_id')->nullable()->index();

            $table->string('status')->default('stored')->index();
            $table->json('meta')->nullable();

            $table->timestamps();

            $table->index(['file_id', 'provider']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_file_links');
    }
};
