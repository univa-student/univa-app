<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const int OLD_LIMIT = 10737418240; // 10 GB
    private const int NEW_LIMIT = 1073741824; // 1 GB

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('storage_limit')->default(self::NEW_LIMIT)->change();
        });

        DB::table('users')
            ->where('storage_limit', self::OLD_LIMIT)
            ->update([
                'storage_limit' => self::NEW_LIMIT,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('storage_limit')->default(self::OLD_LIMIT)->change();
        });

        DB::table('users')
            ->where('storage_limit', self::NEW_LIMIT)
            ->update([
                'storage_limit' => self::OLD_LIMIT,
            ]);
    }
};
