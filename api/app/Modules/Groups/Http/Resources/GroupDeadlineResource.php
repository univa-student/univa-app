<?php

namespace App\Modules\Groups\Http\Resources;

use App\Modules\Files\Http\Resources\FileResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupDeadlineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $myStatus = $this->whenLoaded('memberStatuses', fn () => $this->memberStatuses->firstWhere('user_id', $user?->id));

        return [
            'id' => $this->id,
            'group_id' => $this->group_id,
            'group_subject_id' => $this->group_subject_id,
            'created_by' => $this->created_by,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'priority' => $this->priority,
            'due_at' => $this->due_at?->toISOString(),
            'subject' => GroupSubjectResource::make($this->whenLoaded('subject')),
            'my_status' => $myStatus ? [
                'status' => $myStatus->status?->value ?? $myStatus->status,
                'completed_at' => $myStatus->completed_at?->toISOString(),
            ] : null,
            'attachments' => $this->whenLoaded('attachmentLinks', fn () => FileResource::collection($this->attachmentLinks->pluck('file'))),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
