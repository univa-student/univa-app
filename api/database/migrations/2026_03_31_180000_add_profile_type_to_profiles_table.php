<?php

use App\Modules\Profiles\Models\Profile;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->string('profile_type', 32)
                ->default(Profile::TYPE_DEFAULT)
                ->after('user_id');
        });

        DB::table('profiles')
            ->join('users', 'users.id', '=', 'profiles.user_id')
            ->where('users.username', 'univa')
            ->update([
                'profiles.profile_type' => Profile::TYPE_UNIVA,
            ]);
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn('profile_type');
        });
    }
};
