<?php

namespace App\Modules\Settings\Models;

use App\Core\Traits\HasInsertWithId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApplicationSetting extends Model
{
    use HasInsertWithId, SoftDeletes;

    protected $fillable = [
        'group_id',
        'key',
        'type',
        'label',
        'description',
        'constraints',
        'default_setting_value_id',
    ];

    protected $casts = [
        'constraints' => 'array',
    ];

    public const EMAIL_NOTIFICATION_SETTING_ID = 1;
    public const EMAIL_NOTIFICATION_SETTING_KEY = 'email_notification';
    public const WEEKLY_DIGEST_SETTING_ID = 2;
    public const WEEKLY_DIGEST_SETTING_KEY = 'weekly_digest';
    public const PUSH_IN_BROWSER_NOTIFICATIONS_SETTING_ID = 3;
    public const PUSH_IN_BROWSER_NOTIFICATIONS_SETTING_KEY = 'push_notifications';
    public const SOUND_NOTIFICATIONS_SETTING_ID = 4;
    public const SOUND_NOTIFICATIONS_SETTING_KEY = 'sound_notifications';
    public const APPEARANCE_THEME_SETTING_ID = 5;
    public const APPEARANCE_THEME_SETTING_KEY = 'theme';
    public const APPEARANCE_LANGUAGE_SETTING_ID = 6;
    public const APPEARANCE_LANGUAGE_SETTING_KEY = 'language';
    public const APPEARANCE_COMPACT_MODE_SETTING_ID = 7;
    public const APPEARANCE_COMPACT_MODE_SETTING_KEY = 'compact_mode';
    public const APPEARANCE_ANIMATIONS_SETTING_ID = 8;
    public const APPEARANCE_ANIMATIONS_SETTING_KEY = 'animations';
    public const PRIVACY_PROFILE_SETTING_ID = 9;
    public const PRIVACY_PROFILE_SETTING_KEY = 'privacy_profile';
    public const PRIVACY_ONLINE_STATUS_SETTING_ID = 10;
    public const PRIVACY_ONLINE_STATUS_SETTING_KEY = 'online_status';
    public const SCHEDULER_DEFAULT_VIEW_SETTING_ID = 11;
    public const SCHEDULER_DEFAULT_VIEW_SETTING_KEY = 'scheduler_default_view';
    public const SCHEDULER_SHOW_WEEKENDS_SETTING_ID = 12;
    public const SCHEDULER_SHOW_WEEKENDS_SETTING_KEY = 'scheduler_show_weekends';
    public const SCHEDULER_DAY_START_SETTING_ID = 13;
    public const SCHEDULER_DAY_START_SETTING_KEY = 'scheduler_day_start';
    public const SCHEDULER_DAY_END_SETTING_ID = 14;
    public const SCHEDULER_DAY_END_SETTING_KEY = 'scheduler_day_end';
    public const SCHEDULER_LESSON_REMINDER_SETTING_ID = 15;
    public const SCHEDULER_LESSON_REMINDER_SETTING_KEY = 'scheduler_lesson_reminder';
    public const SCHEDULER_WEEK_PARITY_ANCHOR_SETTING_ID = 16;
    public const SCHEDULER_WEEK_PARITY_ANCHOR_SETTING_KEY = 'scheduler_week_parity_anchor';
    public const AI_PROVIDER_SETTING_ID = 17;
    public const AI_PROVIDER_SETTING_KEY = 'ai_provider';
    public const AI_GEMINI_API_KEY_SETTING_ID = 18;
    public const AI_GEMINI_API_KEY_SETTING_KEY = 'ai_gemini_api_key';
    public const AI_OPENAI_API_KEY_SETTING_ID = 19;
    public const AI_OPENAI_API_KEY_SETTING_KEY = 'ai_openai_api_key';
    public const AI_ANTHROPIC_API_KEY_SETTING_ID = 20;
    public const AI_ANTHROPIC_API_KEY_SETTING_KEY = 'ai_anthropic_api_key';

    public function group(): BelongsTo
    {
        return $this->belongsTo(ApplicationSettingGroup::class, 'group_id');
    }

    public function values(): HasMany
    {
        return $this->hasMany(ApplicationSettingValue::class, 'application_setting_id')
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    public function defaultValue(): BelongsTo
    {
        return $this->belongsTo(ApplicationSettingValue::class, 'default_setting_value_id');
    }
}
