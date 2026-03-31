<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category', 32)->default('study');
            $table->string('priority', 32)->default('medium');
            $table->string('status', 32)->default('todo');
            $table->timestamp('due_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'category']);
            $table->index(['user_id', 'due_at']);
        });

        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->string('title');
            $table->longText('body_markdown');
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_pinned']);
            $table->index(['user_id', 'archived_at']);
            $table->index(['user_id', 'subject_id']);
        });

        Schema::create('note_task', function (Blueprint $table) {
            $table->id();
            $table->foreignId('note_id')->constrained('notes')->cascadeOnDelete();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['note_id', 'task_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('note_task');
        Schema::dropIfExists('notes');
        Schema::dropIfExists('tasks');
    }
};
