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
        Schema::create('ai_context_sessions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // subject / file / deadline / chat / etc.
            $table->nullableMorphs('context');

            $table->string('title')->nullable();
            $table->string('mode')->index();
            $table->string('status')->default('active')->index();

            // ID conversation з Laravel AI SDK
            $table->string('agent_conversation_id')->nullable()->index();

            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_context_sessions');
    }
};
