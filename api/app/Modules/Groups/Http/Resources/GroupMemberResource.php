<?php

namespace App\Modules\Groups\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group_id' => $this->group_id,
            'user_id' => $this->user_id,
            'role' => $this->role?->value ?? $this->role,
            'status' => $this->status?->value ?? $this->status,
            'nickname_in_group' => $this->nickname_in_group,
            'subgroup' => $this->subgroup,
            'joined_at' => $this->joined_at?->toISOString(),
            'left_at' => $this->left_at?->toISOString(),
            'user' => GroupMemberUserResource::make($this->whenLoaded('user')),
            'inviter' => GroupMemberUserResource::make($this->whenLoaded('inviter')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
