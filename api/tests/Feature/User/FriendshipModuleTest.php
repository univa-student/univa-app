<?php

declare(strict_types=1);

namespace Tests\Feature\User;

use App\Models\User;
use App\Modules\Profiles\Models\Profile;
use App\Modules\User\Enums\FriendshipStatus;
use App\Modules\User\Events\FriendshipUpdated;
use App\Modules\User\Models\Friendship;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class FriendshipModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_searches_users_by_name_and_username_without_returning_self(): void
    {
        $viewer = User::factory()->create([
            'first_name' => 'Petro',
            'username' => 'petro.viewer',
        ]);

        $exact = User::factory()->create([
            'first_name' => 'Ivan',
            'username' => 'petro',
        ]);

        $prefix = User::factory()->create([
            'first_name' => 'Olena',
            'username' => 'petro.team',
        ]);

        $nameMatch = User::factory()->create([
            'first_name' => 'Petro',
            'last_name' => 'Sydorenko',
            'username' => 'sydorenko',
        ]);

        User::factory()->create([
            'first_name' => 'Andrii',
            'username' => 'irrelevant-user',
        ]);

        $response = $this->actingAs($viewer)->getJson('/api/v1/me/friends/search?q=petro');

        $response
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.username', $exact->username)
            ->assertJsonPath('data.1.username', $prefix->username)
            ->assertJsonPath('data.2.username', $nameMatch->username)
            ->assertJsonPath('data.0.friendshipStatus', 'none');

        $this->assertSame(
            [$exact->id, $prefix->id, $nameMatch->id],
            array_column($response->json('data'), 'id'),
        );
    }

    public function test_it_limits_search_results_to_twenty_users(): void
    {
        $viewer = User::factory()->create();

        User::factory()->count(25)->create([
            'first_name' => 'Anna',
        ]);

        $response = $this->actingAs($viewer)->getJson('/api/v1/me/friends/search?q=anna');

        $response->assertOk()->assertJsonCount(20, 'data');
    }

    public function test_it_returns_enriched_friend_and_pending_request_cards(): void
    {
        $viewer = User::factory()->create();
        $friend = User::factory()->create([
            'first_name' => 'Maria',
            'last_name' => 'Koval',
            'username' => 'maria.koval',
        ]);
        $sender = User::factory()->create([
            'first_name' => 'Taras',
            'last_name' => 'Melnyk',
            'username' => 'taras.melnyk',
        ]);

        Profile::query()->create([
            'user_id' => $friend->id,
            'profile_image' => null,
            'university_id' => null,
            'city' => 'Kyiv',
            'telegram' => 'maria_friend',
            'phone' => '+380501112233',
        ]);

        Profile::query()->create([
            'user_id' => $sender->id,
            'profile_image' => null,
            'university_id' => null,
            'city' => 'Lviv',
            'telegram' => 'taras_pending',
            'phone' => '+380504445566',
        ]);

        Friendship::query()->create([
            'user_id' => $viewer->id,
            'friend_id' => $friend->id,
            'status' => FriendshipStatus::ACCEPTED,
        ]);

        Friendship::query()->create([
            'user_id' => $sender->id,
            'friend_id' => $viewer->id,
            'status' => FriendshipStatus::PENDING,
        ]);

        $friendsResponse = $this->actingAs($viewer)->getJson('/api/v1/me/friends');
        $pendingResponse = $this->actingAs($viewer)->getJson('/api/v1/me/friends/pending');

        $friendsResponse
            ->assertOk()
            ->assertJsonPath('data.0.username', 'maria.koval')
            ->assertJsonPath('data.0.friendshipStatus', 'accepted')
            ->assertJsonPath('data.0.profile.city', 'Kyiv')
            ->assertJsonPath('data.0.profile.telegram', '@maria_friend')
            ->assertJsonPath('data.0.profile.phone', '+380501112233');

        $pendingResponse
            ->assertOk()
            ->assertJsonPath('data.0.user.username', 'taras.melnyk')
            ->assertJsonPath('data.0.user.friendshipStatus', 'pending_received')
            ->assertJsonPath('data.0.user.profile.city', 'Lviv')
            ->assertJsonPath('data.0.user.profile.telegram', '@taras_pending')
            ->assertJsonPath('data.0.user.profile.phone', '+380504445566');
    }

    public function test_it_broadcasts_friendship_updates_for_send_accept_remove_and_auto_accept(): void
    {
        Event::fake([FriendshipUpdated::class]);

        $sender = User::factory()->create([
            'first_name' => 'Ihor',
        ]);
        $receiver = User::factory()->create();

        $this->actingAs($sender)
            ->postJson("/api/v1/me/users/{$receiver->id}/friends")
            ->assertOk();

        Event::assertDispatched(FriendshipUpdated::class, function (FriendshipUpdated $event) use ($sender, $receiver) {
            return $event->recipientUserId === $sender->id
                && $event->otherUserId === $receiver->id
                && $event->action === 'request_sent'
                && $event->friendshipStatus === 'pending_sent';
        });

        Event::assertDispatched(FriendshipUpdated::class, function (FriendshipUpdated $event) use ($sender, $receiver) {
            return $event->recipientUserId === $receiver->id
                && $event->otherUserId === $sender->id
                && $event->action === 'request_sent'
                && $event->friendshipStatus === 'pending_received';
        });

        Event::fake([FriendshipUpdated::class]);

        $this->actingAs($receiver)
            ->patchJson("/api/v1/me/friends/{$sender->id}/accept")
            ->assertOk();

        Event::assertDispatched(FriendshipUpdated::class, function (FriendshipUpdated $event) use ($sender, $receiver) {
            return in_array($event->recipientUserId, [$sender->id, $receiver->id], true)
                && $event->action === 'accepted'
                && $event->friendshipStatus === 'accepted';
        });

        Event::assertDispatchedTimes(FriendshipUpdated::class, 2);

        Event::fake([FriendshipUpdated::class]);

        $this->actingAs($sender)
            ->deleteJson("/api/v1/me/friends/{$receiver->id}")
            ->assertOk();

        Event::assertDispatched(FriendshipUpdated::class, function (FriendshipUpdated $event) use ($sender, $receiver) {
            return in_array($event->recipientUserId, [$sender->id, $receiver->id], true)
                && $event->action === 'removed'
                && $event->friendshipStatus === 'none';
        });

        Event::assertDispatchedTimes(FriendshipUpdated::class, 2);

        Event::fake([FriendshipUpdated::class]);

        $reverseRequester = User::factory()->create();
        $reverseAccepter = User::factory()->create();

        Friendship::query()->create([
            'user_id' => $reverseAccepter->id,
            'friend_id' => $reverseRequester->id,
            'status' => FriendshipStatus::PENDING,
        ]);

        $this->actingAs($reverseRequester)
            ->postJson("/api/v1/me/users/{$reverseAccepter->id}/friends")
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');

        Event::assertDispatched(FriendshipUpdated::class, function (FriendshipUpdated $event) use ($reverseRequester, $reverseAccepter) {
            return in_array($event->recipientUserId, [$reverseRequester->id, $reverseAccepter->id], true)
                && $event->action === 'accepted'
                && $event->friendshipStatus === 'accepted';
        });

        Event::assertDispatchedTimes(FriendshipUpdated::class, 2);
    }
}
