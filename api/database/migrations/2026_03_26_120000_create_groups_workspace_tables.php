<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('code', 64)->unique();
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->string('avatar')->nullable();
            $table->string('color', 32)->nullable();
            $table->string('visibility', 32)->default('private');
            $table->string('join_policy', 32)->default('invite_or_request');
            $table->boolean('is_active')->default(true);
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('institution_name', 255)->nullable();
            $table->string('institution_short_name', 255)->nullable();
            $table->string('faculty_name', 255)->nullable();
            $table->string('department_name', 255)->nullable();
            $table->string('specialty_name', 255)->nullable();
            $table->unsignedTinyInteger('course')->nullable();
            $table->unsignedSmallInteger('study_year')->nullable();
            $table->string('education_level', 64)->nullable();
            $table->string('study_form', 64)->nullable();
            $table->string('invite_role', 32)->default('headman');
            $table->string('edit_role', 32)->default('moderator');
            $table->string('manage_subjects_role', 32)->default('headman');
            $table->string('manage_schedule_role', 32)->default('headman');
            $table->string('manage_deadlines_role', 32)->default('headman');
            $table->string('manage_files_role', 32)->default('headman');
            $table->string('post_announcements_role', 32)->default('headman');
            $table->string('create_polls_role', 32)->default('headman');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role', 32)->default('student');
            $table->string('status', 32)->default('active');
            $table->string('nickname_in_group', 255)->nullable();
            $table->string('subgroup', 64)->nullable();
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            $table->timestamps();

            $table->unique(['group_id', 'user_id']);
            $table->index(['group_id', 'status']);
        });

        Schema::create('group_invites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('code', 64)->unique();
            $table->string('token', 128)->unique();
            $table->string('status', 32)->default('active');
            $table->unsignedInteger('max_uses')->nullable();
            $table->unsignedInteger('uses_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('group_join_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('message')->nullable();
            $table->string('status', 32)->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['group_id', 'user_id']);
        });

        Schema::create('group_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->string('name', 255);
            $table->string('teacher_name', 255)->nullable();
            $table->string('color', 32)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('group_channels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('group_subject_id')->nullable()->constrained('group_subjects')->nullOnDelete();
            $table->string('name', 255);
            $table->string('slug', 255);
            $table->string('type', 32)->default('general');
            $table->text('description')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->unique(['group_id', 'slug']);
        });

        Schema::create('group_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_channel_id')->constrained('group_channels')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('file_id')->nullable()->constrained('files')->nullOnDelete();
            $table->foreignId('reply_to_id')->nullable()->constrained('group_messages')->nullOnDelete();
            $table->string('type', 32)->default('text');
            $table->text('content')->nullable();
            $table->boolean('is_important')->default(false);
            $table->json('mentions')->nullable();
            $table->json('reactions')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('group_announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('group_channel_id')->nullable()->constrained('group_channels')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('title', 255);
            $table->text('content');
            $table->string('type', 32)->default('organizational');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('requires_acknowledgement')->default(false);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('deadline_at')->nullable();
            $table->json('reactions')->nullable();
            $table->unsignedInteger('comments_count')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('group_announcement_acknowledgements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_announcement_id')->constrained('group_announcements')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('acknowledged_at');
            $table->timestamps();

            $table->unique(['group_announcement_id', 'user_id'], 'group_announcement_user_ack_unique');
        });

        Schema::create('group_polls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->boolean('allows_multiple')->default(false);
            $table->boolean('is_anonymous')->default(false);
            $table->boolean('show_results')->default(true);
            $table->string('status', 32)->default('open');
            $table->timestamp('closes_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('group_poll_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_poll_id')->constrained('group_polls')->cascadeOnDelete();
            $table->string('label', 255);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('group_poll_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_poll_id')->constrained('group_polls')->cascadeOnDelete();
            $table->foreignId('group_poll_option_id')->constrained('group_poll_options')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['group_poll_option_id', 'user_id']);
            $table->index(['group_poll_id', 'user_id']);
        });

        Schema::create('group_schedule_lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('group_subject_id')->constrained('group_subjects')->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday');
            $table->time('starts_at');
            $table->time('ends_at');
            $table->foreignId('lesson_type_id')->constrained('lesson_types')->cascadeOnDelete();
            $table->foreignId('delivery_mode_id')->constrained('delivery_modes')->cascadeOnDelete();
            $table->string('location_text', 255)->nullable();
            $table->text('note')->nullable();
            $table->foreignId('recurrence_rule_id')->constrained('recurrence_rules')->cascadeOnDelete();
            $table->date('active_from');
            $table->date('active_to')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('group_schedule_lesson_exceptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_schedule_lesson_id')->constrained('group_schedule_lessons')->cascadeOnDelete();
            $table->date('date');
            $table->string('action', 32);
            $table->time('override_starts_at')->nullable();
            $table->time('override_ends_at')->nullable();
            $table->string('override_location_text', 255)->nullable();
            $table->string('override_teacher', 255)->nullable();
            $table->foreignId('override_group_subject_id')->nullable()->constrained('group_subjects')->nullOnDelete();
            $table->string('reason', 255)->nullable();
            $table->timestamps();

            $table->unique(['group_schedule_lesson_id', 'date'], 'group_schedule_exception_unique');
        });

        Schema::create('group_exam_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('group_subject_id')->constrained('group_subjects')->cascadeOnDelete();
            $table->foreignId('exam_type_id')->constrained('exam_types')->cascadeOnDelete();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable();
            $table->string('location_text', 255)->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('group_deadlines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('group_subject_id')->nullable()->constrained('group_subjects')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('type', 64)->default('other');
            $table->string('priority', 32)->default('medium');
            $table->dateTime('due_at');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('group_deadline_member_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_deadline_id')->constrained('group_deadlines')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 32)->default('not_started');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['group_deadline_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_deadline_member_statuses');
        Schema::dropIfExists('group_deadlines');
        Schema::dropIfExists('group_exam_events');
        Schema::dropIfExists('group_schedule_lesson_exceptions');
        Schema::dropIfExists('group_schedule_lessons');
        Schema::dropIfExists('group_poll_votes');
        Schema::dropIfExists('group_poll_options');
        Schema::dropIfExists('group_polls');
        Schema::dropIfExists('group_announcement_acknowledgements');
        Schema::dropIfExists('group_announcements');
        Schema::dropIfExists('group_messages');
        Schema::dropIfExists('group_channels');
        Schema::dropIfExists('group_subjects');
        Schema::dropIfExists('group_join_requests');
        Schema::dropIfExists('group_invites');
        Schema::dropIfExists('group_members');
        Schema::dropIfExists('groups');
    }
};
