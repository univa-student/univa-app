<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop old tables (no user data yet)
        Schema::dropIfExists('application_settings');
        Schema::dropIfExists('application_setting_values');

        // New flat settings table
        Schema::create('application_settings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('group_id')
                ->constrained('application_setting_groups')
                ->restrictOnDelete();

            $table->string('key')->unique();   // e.g. "appearance.theme"

            $table->string('type');            // bool | int | string | json | enum

            $table->text('default_value')->nullable();
            $table->text('value')->nullable();  // overrides default when set

            $table->string('label');
            $table->text('description')->nullable();

            $table->json('enum_options')->nullable();  // [{"value":"light","label":"Світла"}]
            $table->json('constraints')->nullable();   // {"min":0,"max":100}

            $table->index('group_id');
            $table->index('key');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_settings');
    }
};
