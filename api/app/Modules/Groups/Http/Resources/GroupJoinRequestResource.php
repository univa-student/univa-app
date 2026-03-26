<?php

namespace App\Modules\Groups\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupJoinRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group_id' => $this->group_id,
            'user_id' => $this->user_id,
            'message' => $this->message,
            'status' => $this->status?->value ?? $this->status,
            'reviewed_by' => $this->reviewed_by,
            'reviewed_at' => $this->reviewed_at?->toISOString(),
            'user' => GroupMemberUserResource::make($this->whenLoaded('user')),
            'reviewer' => GroupMemberUserResource::make($this->whenLoaded('reviewer')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
