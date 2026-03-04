<?php

namespace App\Models\Application\Settings;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationUserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'application_setting_id',
        'application_setting_value_id',
        'raw_value',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function setting(): BelongsTo
    {
        return $this->belongsTo(ApplicationSetting::class, 'application_setting_id');
    }

    public function value(): BelongsTo
    {
        return $this->belongsTo(ApplicationSettingValue::class, 'application_setting_value_id');
    }
}
