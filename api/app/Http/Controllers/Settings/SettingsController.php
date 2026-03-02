<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateSettingRequest;
use App\Http\Resources\Settings\SettingResource;
use App\Services\Settings\SettingsService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function __construct(
        private readonly SettingsService $settingsService,
    ) {}

    /**
     * GET /api/v1/settings?group_id={n}
     *
     * Returns all settings for the given group.
     *
     * Response:
     * {
     *   "status":  "success",
     *   "message": null,
     *   "data":    [ { "key": "...", "type": "...", "value": ..., ... } ]
     * }
     */
    public function index(Request $request): JsonResponse
    {
        $groupId = $request->query('group_id');

        if (!$groupId || !is_numeric($groupId)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'group_id is required and must be a number.',
                'data'    => null,
            ], 422);
        }

        try {
            $settings = $this->settingsService->getGroup((int) $groupId);
        } catch (DomainException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
                'data'    => null,
            ], 404);
        }

        return response()->json([
            'status'  => 'success',
            'message' => null,
            'data'    => SettingResource::collection($settings),
        ]);
    }

    /**
     * PATCH /api/v1/settings/{key}
     *
     * Updates the value of a single setting.
     * The {key} uses dots in its name (e.g. "appearance.theme"), and is URL-encoded.
     *
     * Body: { "value": "dark" }
     *
     * Response:
     * { "status": "success", "message": null, "data": null }
     */
    public function update(string $key, UpdateSettingRequest $request): JsonResponse
    {
        $decodedKey = urldecode($key);

        try {
            $this->settingsService->set($decodedKey, $request->input('value'));
        } catch (DomainException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
                'data'    => null,
            ], 422);
        }

        return response()->json([
            'status'  => 'success',
            'message' => null,
            'data'    => null,
        ]);
    }
}
