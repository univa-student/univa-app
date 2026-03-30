<?php

declare(strict_types=1);

namespace App\Modules\User\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PendingFriendRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $this->resource->sender;
        $user->setAttribute('friendship_status', 'pending_received');

        return [
            'id' => $this->resource->id,
            'created_at' => $this->resource->created_at,
            'user' => new FriendCardResource($user),
        ];
    }
}
