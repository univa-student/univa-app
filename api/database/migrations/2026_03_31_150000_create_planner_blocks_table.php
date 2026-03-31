<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planner_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            $table->string('type', 32);
            $table->string('status', 32)->default('planned');

            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->date('date')->index();

            $table->boolean('is_all_day')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->boolean('created_by_ai')->default(false);

            $table->string('color', 32)->nullable();
            $table->string('source_type', 32)->nullable();
            $table->unsignedBigInteger('source_id')->nullable();

            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->foreignId('deadline_id')->nullable()->constrained('deadlines')->nullOnDelete();
            $table->foreignId('schedule_lesson_id')->nullable()->constrained('schedule_lessons')->nullOnDelete();

            $table->unsignedInteger('priority')->nullable();
            $table->unsignedInteger('estimated_minutes')->nullable();
            $table->unsignedInteger('actual_minutes')->nullable();
            $table->string('energy_level', 16)->nullable();

            $table->json('meta')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'start_at', 'end_at']);
            $table->index(['user_id', 'status']);
            $table->index(['task_id']);
            $table->index(['deadline_id']);
            $table->index(['schedule_lesson_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planner_blocks');
    }
};
