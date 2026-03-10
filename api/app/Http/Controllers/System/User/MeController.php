<?php

namespace App\Http\Controllers\System\User;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\UserResource;
use App\Http\Resources\Settings\SelectedSettingResource;
use App\Models\Application\Settings\ApplicationSetting;
use App\Models\Application\Settings\ApplicationUserSetting;
use App\Services\Settings\SettingsService;
use Illuminate\Http\JsonResponse;

class MeController extends Controller
{
    public function user(): JsonResponse
    {
        $user = auth()->user();

        return ApiResponse::make(
            state: ResponseState::OK,
            data: UserResource::make($user),
        );
    }

    /**
     * @throws UnivaHttpException
     */
    public function settings(): JsonResponse
    {
        $userId = auth()->id();

        $all = ApplicationSetting::query()
            ->with(['defaultValue'])
            ->orderBy('group_id')
            ->orderBy('id')
            ->get();

        $overrides = ApplicationUserSetting::query()
            ->with(['setting', 'value'])
            ->where('user_id', $userId)
            ->get()
            ->keyBy('application_setting_id');

        $selected = $all->map(function (ApplicationSetting $setting) use ($overrides, $userId) {
            $row = $overrides->get($setting->id);

            if ($row) {
                $row->setRelation('setting', $setting);
                return $row;
            }

            $virtual = new ApplicationUserSetting();
            $virtual->id = null;
            $virtual->user_id = $userId;
            $virtual->application_setting_id = $setting->id;
            $virtual->application_setting_value_id = $setting->default_setting_value_id;

            $virtual->setRelation('setting', $setting);
            $virtual->setRelation('value', $setting->defaultValue);

            return $virtual;
        });

        return ApiResponse::make(
            state: ResponseState::OK,
            data: SelectedSettingResource::collection($selected),
        );
    }
}
