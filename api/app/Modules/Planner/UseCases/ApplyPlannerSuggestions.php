<?php

namespace App\Modules\Planner\UseCases;

use App\Models\User;
use App\Modules\Planner\Events\PlannerSuggestionApplied;
use Illuminate\Support\Facades\DB;

class ApplyPlannerSuggestions
{
    public function __construct(
        private readonly CreatePlannerBlock $createPlannerBlock,
    ) {}

    public function handle(User $user, array $blocks): array
    {
        return DB::transaction(function () use ($user, $blocks): array {
            $created = [];

            foreach ($blocks as $blockData) {
                $result = $this->createPlannerBlock->handle($user, array_merge($blockData, [
                    'created_by_ai' => true,
                ]));

                $created[] = $result['block'];
            }

            event(new PlannerSuggestionApplied($user->id, $created));

            return $created;
        });
    }
}
