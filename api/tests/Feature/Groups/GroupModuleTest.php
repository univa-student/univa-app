<?php

declare(strict_types=1);

namespace Tests\Feature\Groups;

use App\Models\User;
use App\Modules\Groups\Models\Group;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GroupModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_group_with_owner_membership_default_channels_and_root_folder(): void
    {
        $owner = User::factory()->create();

        $response = $this->actingAs($owner)->postJson('/api/v1/groups', [
            'name' => 'КН-21',
            'code' => 'KN-21',
            'description' => 'Група комп’ютерних наук.',
            'institution_name' => 'ЦДУ',
            'specialty_name' => 'Комп’ютерні науки',
            'course' => 3,
            'study_year' => 2023,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'КН-21')
            ->assertJsonPath('data.code', 'KN-21')
            ->assertJsonPath('data.institutionName', 'ЦДУ')
            ->assertJsonPath('data.specialtyName', 'Комп’ютерні науки');

        $groupId = (int) $response->json('data.id');

        $this->assertDatabaseHas('groups', [
            'id' => $groupId,
            'owner_id' => $owner->id,
            'created_by' => $owner->id,
            'code' => 'KN-21',
            'name' => 'КН-21',
        ]);

        $this->assertDatabaseHas('group_members', [
            'group_id' => $groupId,
            'user_id' => $owner->id,
            'role' => 'owner',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('group_channels', [
            'group_id' => $groupId,
            'slug' => 'general',
            'type' => 'general',
            'is_default' => true,
        ]);

        $this->assertDatabaseHas('group_channels', [
            'group_id' => $groupId,
            'slug' => 'announcements',
            'type' => 'announcements',
            'is_default' => true,
        ]);

        $this->assertDatabaseHas('folders', [
            'group_id' => $groupId,
            'group_subject_id' => null,
            'parent_id' => null,
        ]);

        $this->actingAs($owner)
            ->getJson('/api/v1/groups')
            ->assertOk()
            ->assertJsonPath('data.0.id', $groupId);
    }

    public function test_it_supports_invites_join_requests_leave_flow_and_role_permissions(): void
    {
        $owner = User::factory()->create();
        $invitee = User::factory()->create();
        $requester = User::factory()->create();
        $outsider = User::factory()->create();

        $group = $this->createGroup($owner, [
            'name' => 'ПІ-21',
            'code' => 'PI-21',
        ]);

        $inviteResponse = $this->actingAs($owner)->postJson("/api/v1/groups/{$group->id}/invites", [
            'max_uses' => 3,
        ]);

        $inviteResponse
            ->assertCreated()
            ->assertJsonPath('data.code', $inviteResponse->json('data.code'));

        $inviteCode = (string) $inviteResponse->json('data.code');

        $this->actingAs($invitee)
            ->postJson('/api/v1/groups/join', [
                'identifier' => $inviteCode,
            ])
            ->assertOk()
            ->assertJsonPath('data.groupId', $group->id)
            ->assertJsonPath('data.status', 'active');

        $joinRequestResponse = $this->actingAs($requester)->postJson("/api/v1/groups/{$group->id}/join-requests", [
            'message' => 'Хочу долучитися до групи.',
        ]);

        $joinRequestResponse
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        $joinRequestId = (int) $joinRequestResponse->json('data.id');

        $this->actingAs($owner)
            ->patchJson("/api/v1/groups/{$group->id}/join-requests/{$joinRequestId}", [
                'status' => 'approved',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('group_members', [
            'group_id' => $group->id,
            'user_id' => $requester->id,
            'role' => 'student',
            'status' => 'active',
        ]);

        $this->actingAs($invitee)
            ->postJson("/api/v1/groups/{$group->id}/leave")
            ->assertOk()
            ->assertJsonPath('data.status', 'left');

        $this->assertDatabaseHas('group_members', [
            'group_id' => $group->id,
            'user_id' => $invitee->id,
            'status' => 'left',
        ]);

        $this->actingAs($outsider)
            ->getJson("/api/v1/groups/{$group->id}/overview")
            ->assertForbidden();

        $this->actingAs($requester)
            ->postJson("/api/v1/groups/{$group->id}/announcements", [
                'title' => 'Не можу постити',
                'content' => 'Я студент і не маю доступу.',
            ])
            ->assertForbidden();
    }

    public function test_it_builds_group_workspace_resources_and_keeps_group_files_out_of_personal_scope(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create();
        $group = $this->createGroup($owner, [
            'name' => 'ІПЗ-31',
            'code' => 'IPZ-31',
        ]);

        $subjectResponse = $this->actingAs($owner)->postJson("/api/v1/groups/{$group->id}/subjects", [
            'name' => 'Програмування',
            'teacher_name' => 'Ірина Коваль',
            'color' => '#2563eb',
            'description' => 'Практичні заняття та лабораторні.',
        ]);

        $subjectResponse
            ->assertCreated()
            ->assertJsonPath('data.name', 'Програмування');

        $subjectId = (int) $subjectResponse->json('data.id');

        $lessonTypeId = (int) DB::table('lesson_types')->where('code', 'lecture')->value('id');
        $deliveryModeId = (int) DB::table('delivery_modes')->where('code', 'offline')->value('id');
        $recurrenceRuleId = (int) DB::table('recurrence_rules')->where('code', 'weekly')->value('id');

        $today = now();

        $this->actingAs($owner)
            ->postJson("/api/v1/groups/{$group->id}/schedule/lessons", [
                'group_subject_id' => $subjectId,
                'weekday' => $today->isoWeekday(),
                'starts_at' => '10:00',
                'ends_at' => '11:30',
                'lesson_type_id' => $lessonTypeId,
                'delivery_mode_id' => $deliveryModeId,
                'recurrence_rule_id' => $recurrenceRuleId,
                'location_text' => 'Аудиторія 214',
                'active_from' => $today->toDateString(),
            ])
            ->assertCreated();

        $announcementResponse = $this->actingAs($owner)->postJson("/api/v1/groups/{$group->id}/announcements", [
            'title' => 'Консультація',
            'content' => 'Зустріч перед лабораторною у четвер.',
            'type' => 'headman',
            'is_pinned' => true,
        ]);

        $announcementResponse
            ->assertCreated()
            ->assertJsonPath('data.title', 'Консультація');

        $pollResponse = $this->actingAs($owner)->postJson("/api/v1/groups/{$group->id}/polls", [
            'title' => 'Коли провести консультацію?',
            'allows_multiple' => false,
            'is_anonymous' => false,
            'options' => [
                ['label' => 'Понеділок'],
                ['label' => 'Середа'],
            ],
        ]);

        $pollResponse
            ->assertCreated()
            ->assertJsonCount(2, 'data.options');

        $pollId = (int) $pollResponse->json('data.id');
        $firstOptionId = (int) $pollResponse->json('data.options.0.id');

        $this->actingAs($owner)
            ->postJson("/api/v1/groups/{$group->id}/polls/{$pollId}/vote", [
                'option_ids' => [$firstOptionId],
            ])
            ->assertOk();

        $this->assertDatabaseHas('group_poll_votes', [
            'group_poll_id' => $pollId,
            'group_poll_option_id' => $firstOptionId,
            'user_id' => $owner->id,
        ]);

        $deadlineResponse = $this->actingAs($owner)->postJson("/api/v1/groups/{$group->id}/deadlines", [
            'group_subject_id' => $subjectId,
            'title' => 'Лаба 1',
            'description' => 'Здати першу лабораторну.',
            'type' => 'assignment',
            'priority' => 'high',
            'due_at' => now()->addDays(2)->toISOString(),
        ]);

        $deadlineResponse
            ->assertCreated()
            ->assertJsonPath('data.title', 'Лаба 1');

        $deadlineId = (int) $deadlineResponse->json('data.id');

        $this->actingAs($owner)
            ->patchJson("/api/v1/groups/{$group->id}/deadlines/{$deadlineId}/progress", [
                'status' => 'completed',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $channelId = (int) DB::table('group_channels')
            ->where('group_id', $group->id)
            ->where('slug', 'general')
            ->value('id');

        $this->actingAs($owner)
            ->postJson("/api/v1/groups/{$group->id}/channels/{$channelId}/messages", [
                'content' => 'Підготуйтеся до лабораторної.',
                'is_important' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.content', 'Підготуйтеся до лабораторної.');

        $uploadResponse = $this->actingAs($owner)->post(
            "/api/v1/groups/{$group->id}/files",
            [
                'file' => UploadedFile::fake()->create('lecture.pdf', 24, 'application/pdf'),
                'group_subject_id' => $subjectId,
            ],
            [
                'Accept' => 'application/json',
            ],
        );

        $uploadResponse
            ->assertCreated()
            ->assertJsonPath('data.scope', 'group')
            ->assertJsonPath('data.originalName', 'lecture.pdf');

        $storageKey = (string) $uploadResponse->json('data.storageKey');
        Storage::disk('local')->assertExists($storageKey);

        $this->assertDatabaseHas('files', [
            'group_id' => $group->id,
            'group_subject_id' => $subjectId,
            'scope' => 'group',
            'status' => 'ready',
        ]);

        $this->actingAs($owner)
            ->getJson("/api/v1/groups/{$group->id}/overview")
            ->assertOk()
            ->assertJsonPath('data.group.id', $group->id)
            ->assertJsonPath('data.upcomingSchedule.0.subject.name', 'Програмування')
            ->assertJsonPath('data.upcomingDeadlines.0.title', 'Лаба 1')
            ->assertJsonPath('data.announcements.0.title', 'Консультація')
            ->assertJsonPath('data.recentFiles.0.originalName', 'lecture.pdf')
            ->assertJsonPath('data.recentActivity.0.content', 'Підготуйтеся до лабораторної.');

        $this->actingAs($owner)
            ->getJson("/api/v1/groups/{$group->id}/files/recent")
            ->assertOk()
            ->assertJsonPath('data.0.groupId', $group->id);

        $this->actingAs($owner)
            ->getJson('/api/v1/files')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    private function createGroup(User $user, array $overrides = []): Group
    {
        $response = $this->actingAs($user)->postJson('/api/v1/groups', array_merge([
            'name' => 'КН-21',
            'code' => 'KN-21',
            'institution_name' => 'ЦДУ',
            'specialty_name' => 'Комп’ютерні науки',
            'course' => 3,
            'study_year' => 2023,
        ], $overrides));

        $response->assertCreated();

        return Group::query()->findOrFail((int) $response->json('data.id'));
    }
}
