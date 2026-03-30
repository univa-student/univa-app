<?php

namespace App\Modules\Groups\Services;

use App\Modules\Files\Models\FileLink;
use Illuminate\Database\Eloquent\Model;

class GroupFileLinkService
{
    public function sync(Model $model, array $fileIds): void
    {
        FileLink::query()
            ->where('linkable_type', $model::class)
            ->where('linkable_id', $model->getKey())
            ->delete();

        foreach (array_values(array_unique($fileIds)) as $fileId) {
            FileLink::query()->create([
                'file_id' => $fileId,
                'linkable_type' => $model::class,
                'linkable_id' => $model->getKey(),
            ]);
        }
    }
}
