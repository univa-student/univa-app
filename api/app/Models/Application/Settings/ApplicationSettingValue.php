<?php

namespace App\Models\Application\Settings;

use App\Core\Traits\HasInsertWithId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApplicationSettingValue extends Model
{
    use HasInsertWithId, SoftDeletes;

    protected $fillable = [
        'name',
        'key_name',
        'option_name',
    ];

    public function settings(): HasMany
    {
        return $this->hasMany(ApplicationSetting::class, 'application_setting_value_id');
    }
}
