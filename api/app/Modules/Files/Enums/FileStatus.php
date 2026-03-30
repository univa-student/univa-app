<?php

namespace App\Modules\Files\Enums;

enum FileStatus: string
{
    case Uploading = 'uploading';
    case Ready     = 'ready';
    case Failed    = 'failed';
    case Deleted   = 'deleted';
}
