<?php

namespace App\Modules\Groups\Http\Resources;

use App\Modules\Files\Http\Resources\FileResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupAnnouncementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'group_id' => $this->group_id,
            'group_channel_id' => $this->group_channel_id,
            'created_by' => $this->created_by,
            'title' => $this->title,
            'content' => $this->content,
            'type' => $this->type?->value ?? $this->type,
            'is_pinned' => $this->is_pinned,
            'requires_acknowledgement' => $this->requires_acknowledgement,
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'deadline_at' => $this->deadline_at?->toISOString(),
            'reactions' => $this->reactions,
            'comments_count' => $this->comments_count,
            'creator' => GroupMemberUserResource::make($this->whenLoaded('creator')),
            'acknowledged' => $this->whenLoaded('acknowledgements', fn () => $user ? $this->acknowledgements->contains('user_id', $user->id) : false),
            'attachments' => $this->whenLoaded('attachmentLinks', fn () => FileResource::collection($this->attachmentLinks->pluck('file'))),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
