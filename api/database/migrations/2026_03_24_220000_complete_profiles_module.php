<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->string('profile_image')->nullable()->change();
            $table->foreignId('university_id')->nullable()->change();
        });

        Schema::table('profiles', function (Blueprint $table) {
            $table->text('bio')->nullable()->after('profile_image');
            $table->string('phone', 32)->nullable()->after('bio');
            $table->string('telegram', 64)->nullable()->after('phone');
            $table->string('city', 120)->nullable()->after('telegram');
            $table->date('birth_date')->nullable()->after('city');
        });

        DB::table('profiles')
            ->where('profile_image', '')
            ->update(['profile_image' => null]);

        $now = now();

        $missingProfiles = DB::table('users')
            ->leftJoin('profiles', 'profiles.user_id', '=', 'users.id')
            ->whereNull('profiles.id')
            ->select('users.id', 'users.avatar_path')
            ->get();

        if ($missingProfiles->isNotEmpty()) {
            DB::table('profiles')->insert(
                $missingProfiles
                    ->map(fn (object $user): array => [
                        'user_id' => $user->id,
                        'profile_image' => $user->avatar_path,
                        'university_id' => null,
                        'bio' => null,
                        'phone' => null,
                        'telegram' => null,
                        'city' => null,
                        'birth_date' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ])
                    ->all()
            );
        }
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn([
                'bio',
                'phone',
                'telegram',
                'city',
                'birth_date',
            ]);
        });
    }
};
