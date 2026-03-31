<?php

namespace App\Modules\Organizer\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body_markdown' => $this->body_markdown,
            'subject_id' => $this->subject_id,
            'task_ids' => $this->relationLoaded('tasks')
                ? $this->tasks->pluck('id')->values()->all()
                : [],
            'is_pinned' => (bool) $this->is_pinned,
            'archived_at' => $this->archived_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
