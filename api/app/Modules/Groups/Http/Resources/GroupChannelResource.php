<?php

namespace App\Modules\Groups\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupChannelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group_id' => $this->group_id,
            'group_subject_id' => $this->group_subject_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'type' => $this->type?->value ?? $this->type,
            'description' => $this->description,
            'is_default' => $this->is_default,
            'subject' => GroupSubjectResource::make($this->whenLoaded('subject')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
