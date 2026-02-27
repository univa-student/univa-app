<?php

namespace App\Models\Application\Settings;

use App\Core\Traits\HasInsertWithId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApplicationSettingGroup extends Model
{
    use HasInsertWithId, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
    ];

    public const USER_SETTINGS_GROUP_ID = 1;
    public const SECURITY_SETTINGS_GROUP_ID = 2;
    public const NOTIFICATION_SETTINGS_GROUP_ID = 3;
    public const APPEARANCE_SETTINGS_GROUP_ID = 4;
    public const PRIVACY_SETTINGS_GROUP_ID = 5;
    public const AI_SETTINGS_GROUP_ID = 6;
    public const SCHEDULER_SETTINGS_GROUP_ID = 7;
    public const CHAT_SETTINGS_GROUP_ID = 8;
    public const FILE_SETTINGS_GROUP_ID = 9;
    public const ORGANIZER_SETTINGS_GROUP_ID = 10;
    public const INTEGRATION_SETTINGS_GROUP_ID = 11;
    public const DANGER_ZONE_SETTING_GROUP_ID = 12;

    public function settings(): HasMany
    {
        return $this->hasMany(ApplicationSetting::class, 'application_setting_group_id');
    }
}
