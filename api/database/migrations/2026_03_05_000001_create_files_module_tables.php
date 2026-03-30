<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Folders ──────────────────────────────────────────────────────────────
        Schema::create('folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('folders')->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->string('name', 255);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'parent_id']);
        });

        // ── Files ────────────────────────────────────────────────────────────────
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('folder_id')->nullable()->constrained('folders')->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();

            // Metadata
            $table->string('original_name', 255);
            $table->string('mime_type', 127)->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->string('checksum', 128)->nullable();

            // Storage (agnostic)
            $table->string('storage_disk', 32)->default('local');
            $table->string('storage_key', 512);

            // Status & scope
            $table->string('status', 20)->default('uploading'); // uploading, ready, failed, deleted
            $table->string('scope', 20)->default('personal');   // personal, subject, group

            // Flags
            $table->boolean('is_pinned')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'folder_id']);
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'is_pinned']);

            if (DB::getDriverName() === 'sqlite') {
                $table->index('original_name');
            } else {
                $table->fullText('original_name');
            }
        });

        // ── File Permissions (ACL) ───────────────────────────────────────────────
        Schema::create('file_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('file_id')->constrained('files')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('ability', 20); // view, edit, download
            $table->timestamps();

            $table->unique(['file_id', 'user_id', 'ability']);
        });

        // ── File Links (polymorphic) ─────────────────────────────────────────────
        Schema::create('file_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('file_id')->constrained('files')->cascadeOnDelete();
            $table->string('linkable_type', 100);
            $table->unsignedBigInteger('linkable_id');
            $table->timestamps();

            $table->index(['linkable_type', 'linkable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_links');
        Schema::dropIfExists('file_permissions');
        Schema::dropIfExists('files');
        Schema::dropIfExists('folders');
    }
};
