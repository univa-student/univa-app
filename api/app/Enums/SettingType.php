<?php

namespace App\Enums;

enum SettingType: string
{
    case Bool   = 'bool';
    case Int    = 'int';
    case String = 'string';
    case Json   = 'json';
    case Enum   = 'enum';
}
