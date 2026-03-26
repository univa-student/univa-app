<?php

namespace App\Modules\Groups\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupInviteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group_id' => $this->group_id,
            'created_by' => $this->created_by,
            'code' => $this->code,
            'token' => $this->token,
            'status' => $this->status?->value ?? $this->status,
            'max_uses' => $this->max_uses,
            'uses_count' => $this->uses_count,
            'expires_at' => $this->expires_at?->toISOString(),
            'creator' => GroupMemberUserResource::make($this->whenLoaded('creator')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
