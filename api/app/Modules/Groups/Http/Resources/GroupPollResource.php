<?php

namespace App\Modules\Groups\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupPollResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'group_id' => $this->group_id,
            'created_by' => $this->created_by,
            'title' => $this->title,
            'description' => $this->description,
            'allows_multiple' => $this->allows_multiple,
            'is_anonymous' => $this->is_anonymous,
            'show_results' => $this->show_results,
            'status' => $this->status?->value ?? $this->status,
            'closes_at' => $this->closes_at?->toISOString(),
            'creator' => GroupMemberUserResource::make($this->whenLoaded('creator')),
            'options' => $this->whenLoaded('options', function () use ($user) {
                return $this->options->map(function ($option) use ($user) {
                    return [
                        'id' => $option->id,
                        'label' => $option->label,
                        'position' => $option->position,
                        'votes_count' => $option->relationLoaded('votes') ? $option->votes->count() : 0,
                        'voted_by_me' => $user ? $option->votes->contains('user_id', $user->id) : false,
                    ];
                })->values();
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
