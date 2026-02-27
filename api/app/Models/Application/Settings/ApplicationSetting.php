<?php

namespace App\Models\Application\Settings;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApplicationSetting extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'group_id',
        'key',
        'type',
        'default_value',
        'value',
        'label',
        'description',
        'enum_options',
        'constraints',
    ];

    protected $casts = [
        'enum_options' => 'array',
        'constraints'  => 'array',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(ApplicationSettingGroup::class, 'group_id');
    }
}
