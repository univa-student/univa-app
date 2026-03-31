<?php

declare(strict_types=1);

namespace App\Modules\Schedule\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleLessonSubjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'teacher_name' => $this->teacher_name,
            'color' => $this->color,
            'files_count' => $this->whenCounted('files'),
        ];
    }
}
