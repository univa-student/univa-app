<?php

namespace App\Modules\Planner\UseCases;

use App\Models\User;
use App\Modules\Deadlines\Models\Deadline;
use App\Modules\Planner\Enums\PlannerBlockType;
use Illuminate\Support\Facades\DB;

class CreatePlannerBlocksFromDeadline
{
    public function __construct(
        private readonly CreatePlannerBlock $createPlannerBlock,
    ) {}

    public function handle(User $user, Deadline $deadline, array $data): array
    {
        $payloads = $data['blocks'] ?? [$data];

        return DB::transaction(function () use ($user, $deadline, $payloads): array {
            $created = [];
            $meta = [];

            foreach ($payloads as $payload) {
                $result = $this->createPlannerBlock->handle($user, array_merge($payload, [
                    'title' => $payload['title'] ?? $deadline->title,
                    'description' => $payload['description'] ?? $deadline->description,
                    'subject_id' => $payload['subject_id'] ?? $deadline->subject_id,
                    'deadline_id' => $deadline->id,
                    'type' => PlannerBlockType::DEADLINE->value,
                ]));

                $created[] = $result['block'];
                if ($result['meta'] !== []) {
                    $meta[] = $result['meta'];
                }
            }

            return [
                'blocks' => $created,
                'meta' => $meta === [] ? [] : ['items' => $meta],
            ];
        });
    }
}
