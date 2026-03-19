<?php

namespace App\Http\Controllers\Settings;

use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\BulkUpdateSettingsRequest;
use App\Http\Requests\Settings\IndexSettingsRequest;
use App\Http\Requests\Settings\UpdateSettingRequest;
use App\Services\Settings\SettingsService;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function __construct(
        private readonly SettingsService $settingsService,
    ) {}

    public function index(IndexSettingsRequest $request): JsonResponse
    {
        $groupId = $request->integer('group_id');

        try {
            $settings = $this->settingsService->getGroupForUser(
                groupId: $groupId,
                userId: (int) auth()->id(),
            );
        } catch (UnivaHttpException $e) {
            return $e->render();
        }

        return \App\Core\Response\ApiResponse::data($settings);
    }

    public function update(string $key, UpdateSettingRequest $request): JsonResponse
    {
        $decodedKey = urldecode($key);

        try {
            $this->settingsService->setForUser(
                userId: (int) auth()->id(),
                key: $decodedKey,
                value: (string) $request->input('value'),
            );
        } catch (UnivaHttpException $e) {
            return $e->render();
        }

        return \App\Core\Response\ApiResponse::ok('Setting updated.');
    }

    public function bulkUpdate(BulkUpdateSettingsRequest $request): JsonResponse
    {
        try {
            $this->settingsService->bulkSetForUser(
                userId: (int) auth()->id(),
                pairs:  $request->input('settings'),
            );
        } catch (UnivaHttpException $e) {
            return $e->render();
        }

        return \App\Core\Response\ApiResponse::ok('Settings bulk updated.');
    }
}
