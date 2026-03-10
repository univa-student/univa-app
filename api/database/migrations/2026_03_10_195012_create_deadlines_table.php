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
        Schema::create('deadlines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            
            $table->string('type')->default('homework')->comment('homework, lab, practice, essay, presentation, module, coursework, exam, credit, other');
            $table->string('priority')->default('medium')->comment('low, medium, high, critical');
            $table->string('status')->default('new')->comment('new, in_progress, completed, cancelled');
            
            $table->dateTime('due_at');
            $table->dateTime('completed_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'due_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deadlines');
    }
};
