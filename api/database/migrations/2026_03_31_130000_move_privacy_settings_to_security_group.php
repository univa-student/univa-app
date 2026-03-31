<?php

use App\Modules\Settings\Models\ApplicationSetting;
use App\Modules\Settings\Models\ApplicationSettingGroup;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('application_setting_groups')->updateOrInsert(
            ['id' => ApplicationSettingGroup::SECURITY_SETTINGS_GROUP_ID],
            [
                'code' => 'security_settings',
                'name' => 'Безпека',
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
        );

        DB::table('application_settings')
            ->whereIn('id', [
                ApplicationSetting::PRIVACY_PROFILE_SETTING_ID,
                ApplicationSetting::PRIVACY_ONLINE_STATUS_SETTING_ID,
            ])
            ->update([
                'group_id' => ApplicationSettingGroup::SECURITY_SETTINGS_GROUP_ID,
                'updated_at' => $now,
            ]);
    }

    public function down(): void
    {
        $now = now();

        DB::table('application_settings')
            ->whereIn('id', [
                ApplicationSetting::PRIVACY_PROFILE_SETTING_ID,
                ApplicationSetting::PRIVACY_ONLINE_STATUS_SETTING_ID,
            ])
            ->update([
                'group_id' => ApplicationSettingGroup::PRIVACY_SETTINGS_GROUP_ID,
                'updated_at' => $now,
            ]);

        DB::table('application_setting_groups')
            ->where('id', ApplicationSettingGroup::SECURITY_SETTINGS_GROUP_ID)
            ->delete();
    }
};
