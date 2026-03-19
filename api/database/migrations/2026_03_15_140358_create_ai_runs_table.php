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
        Schema::create('ai_runs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('session_id')
                ->nullable()
                ->constrained('ai_context_sessions')
                ->nullOnDelete();

            $table->string('use_case')->index();
            $table->string('agent')->index();
            $table->string('provider')->index();
            $table->string('model')->nullable()->index();
            $table->string('status')->default('pending')->index();

            $table->json('input_snapshot')->nullable();
            $table->json('context_snapshot')->nullable();

            $table->string('result_type')->nullable()->index();

            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();

            $table->unsignedInteger('latency_ms')->nullable();

            $table->longText('error_message')->nullable();
            $table->json('meta')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_runs');
    }
};
