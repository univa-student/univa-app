<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('application_setting_groups', function (Blueprint $table) {
            $table->id();

            $table->string('code')->unique();
            $table->string('name');

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('application_setting_values', function (Blueprint $table) {
            $table->id();

            $table->string('key_name');
            $table->string('option_name');
            $table->string('name');

            $table->unique(['key_name', 'option_name']);

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('application_settings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('key');
            $table->string('name');

            $table->foreignId('application_setting_value_id')
                ->constrained('application_setting_values')
                ->restrictOnDelete();

            $table->foreignId('application_setting_group_id')
                ->constrained('application_setting_groups')
                ->restrictOnDelete();

            $table->index('application_setting_value_id');
            $table->index('application_setting_group_id');

            $table->unique(['user_id', 'key']);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_settings');
        Schema::dropIfExists('application_setting_values');
        Schema::dropIfExists('application_setting_groups');
    }
};
