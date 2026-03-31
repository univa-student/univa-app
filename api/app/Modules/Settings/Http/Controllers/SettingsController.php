<?php

namespace App\Modules\Settings\Http\Controllers;

use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Settings\Http\Requests\BulkUpdateSettingsRequest;
use App\Modules\Settings\Http\Requests\IndexSettingsRequest;
use App\Modules\Settings\Http\Requests\UpdateSettingRequest;
use App\Modules\Settings\Services\SettingsService;
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

        return \App\Core\Response\ApiResponse::ok('Налаштування оновлено.');
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

        return \App\Core\Response\ApiResponse::ok('Налаштування масово оновлено.');
    }
}
