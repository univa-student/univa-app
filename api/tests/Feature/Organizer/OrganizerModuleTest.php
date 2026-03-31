<?php

declare(strict_types=1);

namespace Tests\Feature\Organizer;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class OrganizerModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_crud_tasks_and_filter_them(): void
    {
        $user = User::factory()->create();

        $createResponse = $this->actingAs($user)->postJson('/api/v1/tasks', [
            'title' => 'Prepare summary',
            'description' => 'Split the topic into short blocks.',
            'category' => 'study',
            'priority' => 'high',
            'status' => 'todo',
            'due_at' => Carbon::now()->addDay()->toISOString(),
        ]);

        $taskId = (int) $createResponse->json('data.id');

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.category', 'study')
            ->assertJsonPath('data.status', 'todo');

        $this->actingAs($user)->postJson('/api/v1/tasks', [
            'title' => 'Buy groceries',
            'description' => null,
            'category' => 'personal',
            'priority' => 'low',
            'status' => 'in_progress',
            'due_at' => null,
        ])->assertCreated();

        $this->actingAs($user)->getJson('/api/v1/tasks?category=study')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $taskId);

        $updateResponse = $this->actingAs($user)->patchJson("/api/v1/tasks/{$taskId}", [
            'status' => 'done',
        ]);

        $updateResponse
            ->assertOk()
            ->assertJsonPath('data.status', 'done');

        $this->assertNotNull($updateResponse->json('data.completed_at'));

        $this->assertDatabaseHas('tasks', [
            'id' => $taskId,
            'status' => 'done',
            'category' => 'study',
        ]);

        $this->actingAs($user)->deleteJson("/api/v1/tasks/{$taskId}")
            ->assertOk();

        $this->assertDatabaseMissing('tasks', [
            'id' => $taskId,
        ]);
    }

    public function test_it_enforces_task_ownership_and_note_linking_validation(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();

        $subjectId = DB::table('subjects')->insertGetId([
            'user_id' => $owner->id,
            'name' => 'Programming',
            'teacher_name' => 'Teacher',
            'color' => '#0f766e',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $taskId = DB::table('tasks')->insertGetId([
            'user_id' => $owner->id,
            'title' => 'Write plan',
            'description' => null,
            'category' => 'study',
            'priority' => 'medium',
            'status' => 'todo',
            'due_at' => null,
            'completed_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($intruder)->getJson("/api/v1/tasks/{$taskId}")
            ->assertForbidden();

        $foreignSubjectId = DB::table('subjects')->insertGetId([
            'user_id' => $intruder->id,
            'name' => 'Finance',
            'teacher_name' => null,
            'color' => '#b91c1c',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($owner)->postJson('/api/v1/notes', [
            'title' => 'Invalid note',
            'body_markdown' => 'Trying to link foreign subject.',
            'subject_id' => $foreignSubjectId,
            'task_ids' => [],
        ])->assertStatus(422);

        $noteResponse = $this->actingAs($owner)->postJson('/api/v1/notes', [
            'title' => 'Linked note',
            'body_markdown' => 'Execution plan',
            'subject_id' => $subjectId,
            'task_ids' => [$taskId],
        ]);

        $noteResponse->assertCreated();
        $this->assertSame([$taskId], $noteResponse->json('data.task_ids'));
    }

    public function test_it_can_crud_pin_and_archive_notes(): void
    {
        $user = User::factory()->create();

        $subjectId = DB::table('subjects')->insertGetId([
            'user_id' => $user->id,
            'name' => 'Discrete math',
            'teacher_name' => 'Professor',
            'color' => '#4338ca',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $taskIdA = DB::table('tasks')->insertGetId([
            'user_id' => $user->id,
            'title' => 'Collect theses',
            'description' => null,
            'category' => 'study',
            'priority' => 'high',
            'status' => 'todo',
            'due_at' => null,
            'completed_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $taskIdB = DB::table('tasks')->insertGetId([
            'user_id' => $user->id,
            'title' => 'Refine examples',
            'description' => null,
            'category' => 'study',
            'priority' => 'medium',
            'status' => 'in_progress',
            'due_at' => null,
            'completed_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $createResponse = $this->actingAs($user)->postJson('/api/v1/notes', [
            'title' => 'Seminar prep',
            'body_markdown' => "# Plan\n\n- review notes\n- verify formulas",
            'subject_id' => $subjectId,
            'task_ids' => [$taskIdA, $taskIdB],
        ]);

        $noteId = (int) $createResponse->json('data.id');

        $createResponse->assertCreated();
        $this->assertSame("# Plan\n\n- review notes\n- verify formulas", $createResponse->json('data.body_markdown'));
        $this->assertSame([$taskIdA, $taskIdB], $createResponse->json('data.task_ids'));

        $pinResponse = $this->actingAs($user)->patchJson("/api/v1/notes/{$noteId}/pin", [
            'is_pinned' => true,
        ]);

        $pinResponse->assertOk();
        $this->assertTrue((bool) $pinResponse->json('data.is_pinned'));

        $archiveResponse = $this->actingAs($user)->patchJson("/api/v1/notes/{$noteId}/archive", [
            'archived' => true,
        ]);

        $archiveResponse->assertOk();
        $this->assertNotNull($archiveResponse->json('data.archived_at'));

        $this->actingAs($user)->getJson('/api/v1/notes')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->actingAs($user)->getJson('/api/v1/notes?archived=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $noteId);

        $updateNoteResponse = $this->actingAs($user)->patchJson("/api/v1/notes/{$noteId}", [
            'title' => 'Updated note',
            'task_ids' => [$taskIdB],
        ]);

        $updateNoteResponse->assertOk();
        $this->assertSame('Updated note', $updateNoteResponse->json('data.title'));
        $this->assertSame([$taskIdB], $updateNoteResponse->json('data.task_ids'));

        $this->actingAs($user)->deleteJson("/api/v1/notes/{$noteId}")
            ->assertOk();

        $this->assertDatabaseMissing('notes', [
            'id' => $noteId,
        ]);
    }
}
