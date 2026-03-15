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
        Schema::create('ai_usage_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('run_id')
                ->constrained('ai_runs')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('provider')->index();
            $table->string('model')->nullable()->index();

            $table->unsignedInteger('input_tokens')->default(0);
            $table->unsignedInteger('output_tokens')->default(0);
            $table->unsignedInteger('total_tokens')->default(0);

            $table->unsignedInteger('latency_ms')->nullable();

            $table->decimal('estimated_cost_usd', 12, 8)->nullable();

            $table->json('raw_usage')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_usage_logs');
    }
};
