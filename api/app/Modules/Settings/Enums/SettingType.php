<?php

namespace App\Modules\Settings\Enums;

enum SettingType: string
{
    case Bool   = 'bool';
    case Int    = 'int';
    case String = 'string';
    case Json   = 'json';
    case Enum   = 'enum';
}
