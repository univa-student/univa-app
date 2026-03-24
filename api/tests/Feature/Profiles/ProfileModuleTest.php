<?php

declare(strict_types=1);

namespace Tests\Feature\Profiles;

use App\Models\User;
use App\Modules\Profiles\DTO\UniversityDetailsData;
use App\Modules\Profiles\Enums\RegionCode;
use App\Modules\Profiles\Support\UniversitiesByRegion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
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
}
