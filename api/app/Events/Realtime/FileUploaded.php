<?php

namespace App\Events\Realtime;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FileUploaded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $fileId,
        public int $id,
        public string $name
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('file.' . $this->fileId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'file.uploaded'; // As expected on the frontend
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
        ];
    }
}
