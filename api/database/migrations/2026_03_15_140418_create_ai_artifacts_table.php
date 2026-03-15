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
        Schema::create('ai_artifacts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('run_id')
                ->constrained('ai_runs')
                ->cascadeOnDelete();

            $table->string('type')->index();
            $table->string('title')->nullable();

            $table->json('content_json')->nullable();
            $table->longText('content_text')->nullable();

            $table->nullableMorphs('source_context');

            $table->timestamps();

            $table->index(['user_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_artifacts');
    }
};
