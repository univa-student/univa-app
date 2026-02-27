<?php

namespace App\Models\Application\Settings;

use App\Core\Traits\HasInsertWithId;
use Illuminate\Database\Eloquent\Model;

class ApplicationSettingValue extends Model
{
    use HasInsertWithId;

    protected $fillable = [
        'name',
        'key_name',
        'option_name',
    ];

    /* =========================
     | BOOLEAN (універсальні)
     ========================= */

    public const  ENABLED = 'enabled';
    public const  ENABLED_ID = 1;

    public const  DISABLED = 'disabled';
    public const  DISABLED_ID = 2;

    /* =========================
     | THEME
     ========================= */

    public const  THEME_LIGHT = 'light';
    public const  THEME_LIGHT_ID = 10;

    public const  THEME_DARK = 'dark';
    public const  THEME_DARK_ID = 11;

    public const  THEME_SYSTEM = 'system';
    public const  THEME_SYSTEM_ID = 12;

    /* =========================
     | AI MODEL
     ========================= */

    public const  AI_MODEL_FAST = 'fast';
    public const  AI_MODEL_FAST_ID = 20;

    public const  AI_MODEL_BALANCED = 'balanced';
    public const  AI_MODEL_BALANCED_ID = 21;

    public const  AI_MODEL_ADVANCED = 'advanced';
    public const  AI_MODEL_ADVANCED_ID = 22;

    /* =========================
     | AI CREATIVITY
     ========================= */

    public const  CREATIVITY_LOW = 'low';
    public const  CREATIVITY_LOW_ID = 30;

    public const  CREATIVITY_MEDIUM = 'medium';
    public const  CREATIVITY_MEDIUM_ID = 31;

    public const  CREATIVITY_HIGH = 'high';
    public const  CREATIVITY_HIGH_ID = 32;

    /* =========================
     | LANGUAGE
     ========================= */

    public const  LANG_UK = 'uk';
    public const  LANG_UK_ID = 40;

    public const  LANG_EN = 'en';
    public const  LANG_EN_ID = 41;

    public const  LANG_PL = 'pl';
    public const  LANG_PL_ID = 42;

    public const  LANG_AUTO = 'auto';
    public const  LANG_AUTO_ID = 43;

    /* =========================
     | CALENDAR
     ========================= */

    public const  FIRST_DAY_MON = 'mon';
    public const  FIRST_DAY_MON_ID = 50;

    public const  FIRST_DAY_SUN = 'sun';
    public const  FIRST_DAY_SUN_ID = 51;

    public const  VIEW_DAY = 'day';
    public const  VIEW_DAY_ID = 52;

    public const  VIEW_WEEK = 'week';
    public const  VIEW_WEEK_ID = 53;

    public const  REMINDER_15 = '15';
    public const  REMINDER_15_ID = 60;

    public const  REMINDER_30 = '30';
    public const  REMINDER_30_ID = 61;

    public const  REMINDER_60 = '60';
    public const  REMINDER_60_ID = 62;

    /* =========================
     | FILE PREVIEW QUALITY
     ========================= */

    public const  PREVIEW_LOW = 'low';
    public const  PREVIEW_LOW_ID = 70;

    public const  PREVIEW_MEDIUM = 'medium';
    public const  PREVIEW_MEDIUM_ID = 71;

    public const  PREVIEW_HIGH = 'high';
    public const  PREVIEW_HIGH_ID = 72;
}
