<?php

namespace App\Modules\Groups\Http\Resources;

use App\Modules\Files\Http\Resources\FileResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group_channel_id' => $this->group_channel_id,
            'user_id' => $this->user_id,
            'file_id' => $this->file_id,
            'reply_to_id' => $this->reply_to_id,
            'type' => $this->type,
            'content' => $this->content,
            'is_important' => $this->is_important,
            'mentions' => $this->mentions,
            'reactions' => $this->reactions,
            'user' => GroupMemberUserResource::make($this->whenLoaded('user')),
            'file' => FileResource::make($this->whenLoaded('file')),
            'attachments' => $this->whenLoaded('attachmentLinks', fn () => FileResource::collection($this->attachmentLinks->pluck('file'))),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
