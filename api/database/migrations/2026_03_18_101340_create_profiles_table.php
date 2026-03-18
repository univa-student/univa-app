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
        Schema::create('universities', function (Blueprint $table) {
            $table->id();

            $table->string('university_id')
                ->nullable()
                ->comment('ID університету в системі ЄДЕБО');

            $table->string('user_id')
                ->nullable()
                ->comment('ID університету в системі ЄДЕБО');

            $table->string('region_code')
                ->nullable()
                ->comment('Code регіону');

            $table->string('location')
                ->nullable()
                ->comment('Code регіону');

            $table->string('university_name')
                ->nullable()
                ->comment('Назва університету');

            $table->string('university_short_name')
                ->nullable()
                ->comment('Коротка назва університету');

            $table->string('university_type_name')
                ->nullable()
                ->comment('Тип університету');

            $table->string('faculty_name')
                ->nullable()
                ->comment('Факультет');

            $table->string('group_code')
                ->nullable()
                ->comment('Назва групи');

            $table->string('course')
                ->nullable()
                ->comment('Курс');

            $table->timestamps();
        });

        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('profile_image');

            $table->foreignId('university_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
        Schema::dropIfExists('universities');
    }
};
