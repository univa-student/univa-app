<?php

declare(strict_types=1);

namespace Tests\Feature\Profiles;

use App\Models\User;
use App\Modules\Profiles\DTO\UniversityDetailsData;
use App\Modules\Profiles\Enums\RegionCode;
use App\Modules\Profiles\Support\UniversitiesByRegion;
use App\Modules\Settings\Models\ApplicationSetting;
use App\Modules\Settings\Models\ApplicationSettingValue;
use App\Modules\Settings\Models\ApplicationUserSetting;
use App\Modules\User\Enums\FriendshipStatus;
use App\Modules\User\Models\Friendship;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Mockery;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class ProfileModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_current_profile_and_creates_it_if_missing(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/v1/me/profile');

        $response
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonPath('data.university', null)
            ->assertJsonPath('data.completion.total', 6);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
        ]);
    }

    public function test_it_updates_student_profile_details(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patchJson('/api/v1/me/profile/details', [
            'bio' => 'Люблю математику та системний дизайн.',
            'phone' => '+380501234567',
            'telegram' => '@student_profile',
            'city' => 'Kyiv',
            'birth_date' => '2004-05-10',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.bio', 'Люблю математику та системний дизайн.')
            ->assertJsonPath('data.telegram', '@student_profile')
            ->assertJsonPath('data.birthDate', '2004-05-10');

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'bio' => 'Люблю математику та системний дизайн.',
            'phone' => '+380501234567',
            'telegram' => 'student_profile',
            'city' => 'Kyiv',
            'birth_date' => '2004-05-10 00:00:00',
        ]);
    }

    public function test_it_can_view_another_users_profile_by_username(): void
    {
        $viewer = User::factory()->create();
        $target = User::factory()->create([
            'username' => 'student.target',
        ]);

        $this->actingAs($target)->patchJson('/api/v1/me/profile/details', [
            'bio' => 'Люблю системний дизайн і математику.',
            'telegram' => '@student_target',
            'city' => 'Lviv',
        ])->assertOk();

        $response = $this->actingAs($viewer)->getJson('/api/v1/profiles/student.target');

        $response
            ->assertOk()
            ->assertJsonPath('data.user.username', 'student.target')
            ->assertJsonPath('data.bio', 'Люблю системний дизайн і математику.')
            ->assertJsonPath('data.telegram', '@student_target')
            ->assertJsonPath('data.city', 'Lviv');
    }

    public function test_it_blocks_private_profile_for_other_users(): void
    {
        $viewer = User::factory()->create();
        $target = User::factory()->create([
            'username' => 'private.student',
        ]);

        $this->setProfileVisibility($target, ApplicationSettingValue::SETTING_PRIVACY_PROFILE_PRIVATE_VALUE);

        $this->actingAs($viewer)
            ->getJson('/api/v1/profiles/private.student')
            ->assertForbidden()
            ->assertJsonPath('message', 'Цей профіль приватний.');
    }

    public function test_it_allows_friends_only_profile_for_friends_and_blocks_strangers(): void
    {
        $friend = User::factory()->create();
        $stranger = User::factory()->create();
        $target = User::factory()->create([
            'username' => 'friends.only',
        ]);

        Friendship::query()->create([
            'user_id' => $target->id,
            'friend_id' => $friend->id,
            'status' => FriendshipStatus::ACCEPTED,
        ]);

        $this->setProfileVisibility($target, ApplicationSettingValue::SETTING_PRIVACY_PROFILE_FRIENDS);

        $this->actingAs($friend)
            ->getJson('/api/v1/profiles/friends.only')
            ->assertOk();

        $this->actingAs($stranger)
            ->getJson('/api/v1/profiles/friends.only')
            ->assertForbidden()
            ->assertJsonPath('message', 'Цей профіль доступний лише друзям.');
    }

    public function test_it_returns_online_status_only_when_viewer_is_allowed_to_see_it(): void
    {
        $viewer = User::factory()->create();
        $target = User::factory()->create([
            'username' => 'online.student',
        ]);

        $this->createActiveSessionForUser($target);

        $this->actingAs($viewer)
            ->getJson('/api/v1/profiles/online.student')
            ->assertOk()
            ->assertJsonPath('data.onlineStatus', true);

        $this->setOnlineStatusVisibility($target, false);

        $this->actingAs($viewer)
            ->getJson('/api/v1/profiles/online.student')
            ->assertOk()
            ->assertJsonPath('data.onlineStatus', null);
    }

    public function test_it_saves_selected_university_for_current_profile(): void
    {
        $user = User::factory()->create();

        $mock = Mockery::mock(UniversitiesByRegion::class);
        $mock->shouldReceive('getByUniversityId')
            ->once()
            ->with('UNI-42')
            ->andReturn(new UniversityDetailsData(
                id: 'UNI-42',
                name: 'Kyiv Polytechnic Institute',
                shortName: 'KPI',
                typeName: 'University',
                nameEn: 'KPI',
                region: RegionCode::KYIV->label(),
                city: 'Kyiv',
                location: 'Kyiv, Kyiv',
                address: null,
                site: null,
                email: null,
                phone: null,
                faculties: [],
                specialities: [],
            ));

        $this->app->instance(UniversitiesByRegion::class, $mock);

        $response = $this->actingAs($user)->postJson('/api/v1/me/profile/university', [
            'university_id' => 'UNI-42',
            'region_code' => RegionCode::KYIV->value,
            'speciality_name' => 'ФІОТ',
            'group_code' => 'IO-31',
            'course' => 3,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.externalId', 'UNI-42')
            ->assertJsonPath('data.groupCode', 'IO-31')
            ->assertJsonPath('data.course', 3);

        $this->assertDatabaseHas('universities', [
            'user_id' => (string) $user->id,
            'university_id' => 'UNI-42',
            'faculty_name' => 'ФІОТ',
            'group_code' => 'IO-31',
            'course' => 3,
        ]);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
        ]);
    }

    public function test_it_can_remove_selected_university_from_profile(): void
    {
        $user = User::factory()->create();

        $mock = Mockery::mock(UniversitiesByRegion::class);
        $mock->shouldReceive('getByUniversityId')
            ->once()
            ->with('UNI-42')
            ->andReturn(new UniversityDetailsData(
                id: 'UNI-42',
                name: 'Kyiv Polytechnic Institute',
                shortName: 'KPI',
                typeName: 'University',
                nameEn: 'KPI',
                region: RegionCode::KYIV->label(),
                city: 'Kyiv',
                location: 'Kyiv, Kyiv',
                address: null,
                site: null,
                email: null,
                phone: null,
                faculties: [],
                specialities: [],
            ));

        $this->app->instance(UniversitiesByRegion::class, $mock);

        $this->actingAs($user)->postJson('/api/v1/me/profile/university', [
            'university_id' => 'UNI-42',
            'region_code' => RegionCode::KYIV->value,
            'speciality_name' => 'ФІОТ',
            'group_code' => 'IO-31',
            'course' => 3,
        ])->assertOk();

        $response = $this->actingAs($user)->deleteJson('/api/v1/me/profile/university');

        $response
            ->assertOk()
            ->assertJsonPath('data.university', null);

        $this->assertDatabaseMissing('universities', [
            'user_id' => (string) $user->id,
        ]);
    }

    private function setProfileVisibility(User $user, string $value): void
    {
        $this->setSettingValue($user, ApplicationSetting::PRIVACY_PROFILE_SETTING_KEY, $value);
    }

    private function setOnlineStatusVisibility(User $user, bool $isVisible): void
    {
        $this->setSettingValue(
            $user,
            ApplicationSetting::PRIVACY_ONLINE_STATUS_SETTING_KEY,
            $isVisible
                ? (string) ApplicationSettingValue::SETTING_ENABLED_VALUE
                : (string) ApplicationSettingValue::SETTING_DISABLED_VALUE,
        );
    }

    private function setSettingValue(User $user, string $key, string $value): void
    {
        $setting = ApplicationSetting::query()
            ->where('key', $key)
            ->firstOrFail();

        $settingValueId = ApplicationSettingValue::query()
            ->where('application_setting_id', $setting->id)
            ->where('value', $value)
            ->value('id');

        ApplicationUserSetting::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'application_setting_id' => $setting->id,
            ],
            [
                'application_setting_value_id' => $settingValueId,
            ],
        );
    }

    private function createActiveSessionForUser(User $user): void
    {
        if ((string) config('session.driver', 'database') === 'file') {
            $sessionPath = (string) config('session.files', storage_path('framework/sessions'));
            File::ensureDirectoryExists($sessionPath);
            File::put(
                $sessionPath.DIRECTORY_SEPARATOR.'session-online-student',
                serialize([
                    Auth::guard('web')->getName() => (string) $user->id,
                ]),
            );

            touch($sessionPath.DIRECTORY_SEPARATOR.'session-online-student', now()->getTimestamp());

            return;
        }

        DB::table('sessions')->insert([
            'id' => 'session-online-student',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'payload' => 'test',
            'last_activity' => now()->getTimestamp(),
        ]);
    }
}
