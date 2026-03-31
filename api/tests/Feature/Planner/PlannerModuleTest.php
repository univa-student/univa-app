<?php

declare(strict_types=1);

namespace Tests\Feature\Planner;

use App\Models\User;
use App\Modules\Deadlines\Models\Deadline;
use App\Modules\Organizer\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PlannerModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_crud_blocks_and_build_day_and_week_views(): void
    {
        $user = User::factory()->create();
        $subjectId = $this->createSubject($user->id, 'Calculus');
        $this->createScheduleLesson($user->id, $subjectId, '09:00', '10:30');

        $createResponse = $this->actingAs($user)->postJson('/api/v1/planner/blocks', [
            'title' => 'Deep work',
            'type' => 'focus',
            'start_at' => '2026-04-01T11:00:00',
            'end_at' => '2026-04-01T12:00:00',
            'subject_id' => $subjectId,
            'priority' => 3,
        ]);

        $blockId = (int) $createResponse->json('data.id');

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.type', 'focus')
            ->assertJsonPath('data.subjectId', $subjectId);

        $this->actingAs($user)->patchJson("/api/v1/planner/blocks/{$blockId}", [
            'title' => 'Updated block',
            'description' => 'Revised topic',
        ])->assertOk()->assertJsonPath('data.title', 'Updated block');

        $this->actingAs($user)->patchJson("/api/v1/planner/blocks/{$blockId}/move", [
            'start_at' => '2026-04-01T12:00:00',
            'end_at' => '2026-04-01T13:00:00',
        ])->assertOk();

        $this->actingAs($user)->patchJson("/api/v1/planner/blocks/{$blockId}/status", [
            'status' => 'completed',
            'actual_minutes' => 55,
        ])->assertOk()->assertJsonPath('data.status', 'completed');

        $dayResponse = $this->actingAs($user)->getJson('/api/v1/planner/day?date=2026-04-01');
        $dayResponse
            ->assertOk()
            ->assertJsonPath('data.date', '2026-04-01')
            ->assertJsonCount(2, 'data.timeline')
            ->assertJsonPath('data.summary.completedMinutes', 55);

        $this->actingAs($user)->getJson('/api/v1/planner/week?date=2026-04-01')
            ->assertOk()
            ->assertJsonPath('data.weekStart', '2026-03-30');

        $this->actingAs($user)->deleteJson("/api/v1/planner/blocks/{$blockId}")
            ->assertOk();

        $this->assertSoftDeleted('planner_blocks', ['id' => $blockId]);
    }

    public function test_it_enforces_ownership_and_conflict_rules(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $subjectId = $this->createSubject($owner->id, 'Physics');
        $this->createScheduleLesson($owner->id, $subjectId, '10:00', '11:30');

        $firstResponse = $this->actingAs($owner)->postJson('/api/v1/planner/blocks', [
            'title' => 'First',
            'type' => 'manual',
            'start_at' => '2026-04-01T08:00:00',
            'end_at' => '2026-04-01T09:00:00',
        ]);

        $blockId = (int) $firstResponse->json('data.id');

        $this->actingAs($owner)->postJson('/api/v1/planner/blocks', [
            'title' => 'Overlap',
            'type' => 'manual',
            'start_at' => '2026-04-01T08:30:00',
            'end_at' => '2026-04-01T09:30:00',
        ])->assertStatus(422);

        $this->actingAs($owner)->postJson('/api/v1/planner/blocks', [
            'title' => 'Lesson conflict',
            'type' => 'focus',
            'start_at' => '2026-04-01T10:15:00',
            'end_at' => '2026-04-01T11:00:00',
        ])->assertStatus(422);

        $this->actingAs($owner)->postJson('/api/v1/planner/blocks', [
            'title' => 'Lesson conflict allowed',
            'type' => 'focus',
            'start_at' => '2026-04-01T10:15:00',
            'end_at' => '2026-04-01T11:00:00',
            'allow_lesson_conflict' => true,
        ])->assertCreated()->assertJsonPath('meta.conflicts.0.kind', 'lesson');

        $this->actingAs($intruder)->patchJson("/api/v1/planner/blocks/{$blockId}", [
            'title' => 'Intruder edit',
        ])->assertForbidden();
    }

    public function test_it_can_plan_from_task_and_deadline_and_sync_source_statuses(): void
    {
        $user = User::factory()->create();
        $subjectId = $this->createSubject($user->id, 'Algorithms');

        $taskId = DB::table('tasks')->insertGetId([
            'user_id' => $user->id,
            'title' => 'Finish task',
            'description' => null,
            'category' => 'study',
            'priority' => 'high',
            'status' => 'todo',
            'due_at' => null,
            'completed_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $deadlineId = DB::table('deadlines')->insertGetId([
            'user_id' => $user->id,
            'subject_id' => $subjectId,
            'title' => 'Submit project',
            'description' => null,
            'type' => 'homework',
            'priority' => 'high',
            'status' => 'new',
            'due_at' => now()->addDays(3),
            'completed_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $taskResponse = $this->actingAs($user)->postJson("/api/v1/planner/tasks/{$taskId}/plan", [
            'start_at' => '2026-04-03T14:00:00',
            'end_at' => '2026-04-03T15:00:00',
        ]);

        $taskBlockId = (int) $taskResponse->json('data.id');
        $taskResponse->assertCreated()->assertJsonPath('data.taskId', $taskId);

        $this->actingAs($user)->patchJson("/api/v1/planner/blocks/{$taskBlockId}/status", [
            'status' => 'in_progress',
        ])->assertOk();

        $this->assertDatabaseHas('tasks', [
            'id' => $taskId,
            'status' => Task::STATUS_IN_PROGRESS,
        ]);

        $this->actingAs($user)->patchJson("/api/v1/planner/blocks/{$taskBlockId}/status", [
            'status' => 'completed',
        ])->assertOk();

        $this->assertDatabaseHas('tasks', [
            'id' => $taskId,
            'status' => Task::STATUS_DONE,
        ]);

        $deadlineResponse = $this->actingAs($user)->postJson("/api/v1/planner/deadlines/{$deadlineId}/plan", [
            'blocks' => [
                [
                    'start_at' => '2026-04-03T16:00:00',
                    'end_at' => '2026-04-03T17:00:00',
                ],
                [
                    'start_at' => '2026-04-04T16:00:00',
                    'end_at' => '2026-04-04T17:00:00',
                ],
            ],
        ]);

        $deadlineResponse->assertCreated()->assertJsonCount(2, 'data');
        $firstDeadlineBlockId = (int) $deadlineResponse->json('data.0.id');
        $secondDeadlineBlockId = (int) $deadlineResponse->json('data.1.id');

        $this->actingAs($user)->patchJson("/api/v1/planner/blocks/{$firstDeadlineBlockId}/status", [
            'status' => 'completed',
        ])->assertOk();

        $this->assertDatabaseHas('deadlines', [
            'id' => $deadlineId,
            'status' => Deadline::STATUS_IN_PROGRESS,
        ]);

        $this->actingAs($user)->patchJson("/api/v1/planner/blocks/{$secondDeadlineBlockId}/status", [
            'status' => 'completed',
        ])->assertOk();

        $this->assertDatabaseHas('deadlines', [
            'id' => $deadlineId,
            'status' => Deadline::STATUS_COMPLETED,
        ]);
    }

    public function test_it_can_generate_and_apply_day_suggestions(): void
    {
        $user = User::factory()->create();

        DB::table('tasks')->insert([
            [
                'user_id' => $user->id,
                'title' => 'Review theory',
                'description' => null,
                'category' => 'study',
                'priority' => 'high',
                'status' => 'todo',
                'due_at' => now()->addDay(),
                'completed_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user->id,
                'title' => 'Write outline',
                'description' => null,
                'category' => 'study',
                'priority' => 'medium',
                'status' => 'todo',
                'due_at' => null,
                'completed_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $suggestionsResponse = $this->actingAs($user)->postJson('/api/v1/planner/suggestions/day', [
            'date' => '2026-04-05',
            'include_tasks' => true,
            'include_deadlines' => false,
            'max_blocks' => 2,
        ]);

        $suggestionsResponse
            ->assertOk()
            ->assertJsonPath('data.date', '2026-04-05')
            ->assertJsonCount(2, 'data.blocks');

        $this->actingAs($user)->postJson('/api/v1/planner/suggestions/apply', [
            'blocks' => $suggestionsResponse->json('data.blocks'),
        ])->assertCreated()->assertJsonCount(2, 'data');

        $this->assertDatabaseCount('planner_blocks', 2);
        $this->assertDatabaseHas('planner_blocks', [
            'user_id' => $user->id,
            'created_by_ai' => true,
        ]);
    }

    private function createSubject(int $userId, string $name): int
    {
        return (int) DB::table('subjects')->insertGetId([
            'user_id' => $userId,
            'name' => $name,
            'teacher_name' => 'Teacher',
            'color' => '#2563eb',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function createScheduleLesson(int $userId, int $subjectId, string $startsAt, string $endsAt): int
    {
        $lessonTypeId = (int) DB::table('lesson_types')->where('code', 'lecture')->value('id');
        $deliveryModeId = (int) DB::table('delivery_modes')->where('code', 'offline')->value('id');
        $recurrenceRuleId = (int) DB::table('recurrence_rules')->where('code', 'weekly')->value('id');

        return (int) DB::table('schedule_lessons')->insertGetId([
            'user_id' => $userId,
            'subject_id' => $subjectId,
            'weekday' => 3,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'lesson_type_id' => $lessonTypeId,
            'delivery_mode_id' => $deliveryModeId,
            'location_text' => 'Room 101',
            'note' => null,
            'recurrence_rule_id' => $recurrenceRuleId,
            'active_from' => '2026-03-01',
            'active_to' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
