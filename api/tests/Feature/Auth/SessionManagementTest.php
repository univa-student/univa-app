<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class SessionManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_current_and_other_active_sessions(): void
    {
        $user = User::factory()->create();
        $currentSessionId = 'session-current';
        $otherSessionId = 'session-other';
        $expiredSessionId = 'session-expired';

        DB::table('sessions')->insert([
            [
                'id' => $currentSessionId,
                'user_id' => $user->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/135.0',
                'payload' => 'payload-current',
                'last_activity' => now()->timestamp,
            ],
            [
                'id' => $otherSessionId,
                'user_id' => $user->id,
                'ip_address' => '192.168.1.8',
                'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1',
                'payload' => 'payload-other',
                'last_activity' => now()->subMinute()->timestamp,
            ],
            [
                'id' => $expiredSessionId,
                'user_id' => $user->id,
                'ip_address' => '10.0.0.5',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Safari/605.1.15',
                'payload' => 'payload-expired',
                'last_activity' => now()->subMinutes(121)->timestamp,
            ],
        ]);

        $response = $this
            ->withCredentials()
            ->withCookie(config('session.cookie'), encrypt($currentSessionId))
            ->actingAs($user)
            ->getJson('/api/v1/me/sessions');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
        $response->assertJsonFragment([
            'id' => $currentSessionId,
            'ipAddress' => '127.0.0.1',
            'current' => true,
        ]);
        $response->assertJsonFragment([
            'id' => $otherSessionId,
            'ipAddress' => '192.168.1.8',
            'current' => false,
        ]);
        $response->assertJsonMissing([
            'id' => $expiredSessionId,
        ]);
    }

    public function test_it_can_terminate_another_session(): void
    {
        $user = User::factory()->create();
        $currentSessionId = 'session-current';
        $otherSessionId = 'session-other';

        DB::table('sessions')->insert([
            [
                'id' => $currentSessionId,
                'user_id' => $user->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0',
                'payload' => 'payload-current',
                'last_activity' => now()->timestamp,
            ],
            [
                'id' => $otherSessionId,
                'user_id' => $user->id,
                'ip_address' => '192.168.1.8',
                'user_agent' => 'Mozilla/5.0',
                'payload' => 'payload-other',
                'last_activity' => now()->subMinute()->timestamp,
            ],
        ]);

        $response = $this
            ->withCredentials()
            ->withCookie(config('session.cookie'), encrypt($currentSessionId))
            ->actingAs($user)
            ->deleteJson("/api/v1/me/sessions/{$otherSessionId}");

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Session terminated.');

        $this->assertDatabaseMissing('sessions', [
            'id' => $otherSessionId,
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseHas('sessions', [
            'id' => $currentSessionId,
            'user_id' => $user->id,
        ]);
    }

    public function test_it_rejects_terminating_the_current_session_from_sessions_endpoint(): void
    {
        $user = User::factory()->create();
        $currentSessionId = 'session-current';

        DB::table('sessions')->insert([
            'id' => $currentSessionId,
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'payload' => 'payload-current',
            'last_activity' => now()->timestamp,
        ]);

        $response = $this
            ->withCredentials()
            ->withCookie(config('session.cookie'), encrypt($currentSessionId))
            ->actingAs($user)
            ->deleteJson("/api/v1/me/sessions/{$currentSessionId}");

        $response
            ->assertUnprocessable()
            ->assertJsonPath('message', 'You cannot terminate the current session here.');

        $this->assertDatabaseHas('sessions', [
            'id' => $currentSessionId,
            'user_id' => $user->id,
        ]);
    }

    public function test_it_lists_file_based_sessions_when_session_driver_is_file(): void
    {
        $user = User::factory()->create();
        $currentSessionId = 'file-session-current';
        $otherSessionId = 'file-session-other';
        $directory = storage_path('framework/testing-sessions');

        File::deleteDirectory($directory);
        File::ensureDirectoryExists($directory);

        config([
            'session.driver' => 'file',
            'session.files' => $directory,
        ]);

        File::put(
            $directory.DIRECTORY_SEPARATOR.$currentSessionId,
            serialize($this->makeFileSessionPayload($user->id)),
        );
        File::put(
            $directory.DIRECTORY_SEPARATOR.$otherSessionId,
            serialize($this->makeFileSessionPayload($user->id)),
        );

        touch($directory.DIRECTORY_SEPARATOR.$currentSessionId, now()->timestamp);
        touch($directory.DIRECTORY_SEPARATOR.$otherSessionId, now()->subMinute()->timestamp);

        $response = $this
            ->withCredentials()
            ->withCookie(config('session.cookie'), encrypt($currentSessionId))
            ->actingAs($user)
            ->getJson('/api/v1/me/sessions');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
        $response->assertJsonFragment([
            'id' => $currentSessionId,
            'current' => true,
            'ipAddress' => null,
            'userAgent' => null,
        ]);
        $response->assertJsonFragment([
            'id' => $otherSessionId,
            'current' => false,
            'ipAddress' => null,
            'userAgent' => null,
        ]);
    }

    public function test_it_can_terminate_another_file_based_session(): void
    {
        $user = User::factory()->create();
        $currentSessionId = 'file-session-current';
        $otherSessionId = 'file-session-other';
        $directory = storage_path('framework/testing-sessions');

        File::deleteDirectory($directory);
        File::ensureDirectoryExists($directory);

        config([
            'session.driver' => 'file',
            'session.files' => $directory,
        ]);

        File::put(
            $directory.DIRECTORY_SEPARATOR.$currentSessionId,
            serialize($this->makeFileSessionPayload($user->id)),
        );
        File::put(
            $directory.DIRECTORY_SEPARATOR.$otherSessionId,
            serialize($this->makeFileSessionPayload($user->id)),
        );

        $response = $this
            ->withCredentials()
            ->withCookie(config('session.cookie'), encrypt($currentSessionId))
            ->actingAs($user)
            ->deleteJson("/api/v1/me/sessions/{$otherSessionId}");

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Session terminated.');

        $this->assertFileExists($directory.DIRECTORY_SEPARATOR.$currentSessionId);
        $this->assertFileDoesNotExist($directory.DIRECTORY_SEPARATOR.$otherSessionId);
    }

    /**
     * @return array<string, mixed>
     */
    private function makeFileSessionPayload(int $userId): array
    {
        return [
            '_token' => 'csrf-token',
            '_flash' => [
                'old' => [],
                'new' => [],
            ],
            Auth::guard('web')->getName() => $userId,
        ];
    }
}
