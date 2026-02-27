<?php

namespace App\Models\Application\Settings;

use App\Core\Traits\HasInsertWithId;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApplicationSetting extends Model
{
    use HasInsertWithId, SoftDeletes;

    protected $fillable = [
        'user_id',
        'key',
        'name',
        'application_setting_value_id',
        'application_setting_group_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function value(): BelongsTo
    {
        return $this->belongsTo(ApplicationSettingValue::class, 'application_setting_value_id');
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(ApplicationSettingGroup::class, 'application_setting_group_id');
    }
}
