<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('folders', function (Blueprint $table) {
            $table->foreignId('group_id')->nullable()->after('subject_id')->constrained('groups')->nullOnDelete();
            $table->foreignId('group_subject_id')->nullable()->after('group_id')->constrained('group_subjects')->nullOnDelete();
            $table->index(['group_id', 'parent_id']);
        });

        Schema::table('files', function (Blueprint $table) {
            $table->foreignId('group_id')->nullable()->after('subject_id')->constrained('groups')->nullOnDelete();
            $table->foreignId('group_subject_id')->nullable()->after('group_id')->constrained('group_subjects')->nullOnDelete();
            $table->index(['group_id', 'folder_id']);
            $table->index(['group_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('files', function (Blueprint $table) {
            $table->dropConstrainedForeignId('group_subject_id');
            $table->dropConstrainedForeignId('group_id');
        });

        Schema::table('folders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('group_subject_id');
            $table->dropConstrainedForeignId('group_id');
        });
    }
};
