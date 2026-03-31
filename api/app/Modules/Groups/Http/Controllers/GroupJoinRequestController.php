<?php

namespace App\Modules\Groups\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Groups\Http\Requests\RespondGroupJoinRequestRequest;
use App\Modules\Groups\Http\Requests\StoreGroupJoinRequestRequest;
use App\Modules\Groups\Http\Resources\GroupJoinRequestResource;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupJoinRequest;
use App\Modules\Groups\Services\GroupPermissionService;
use App\Modules\Groups\UseCases\CreateGroupJoinRequest;
use App\Modules\Groups\UseCases\RespondToGroupJoinRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupJoinRequestController extends Controller
{
    /**
     * @throws UnivaHttpException
     */
    public function index(Group $group, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->authorize($request->user(), $group, 'invite');

        $items = $group->joinRequests()->with(['user', 'reviewer'])->latest()->get();

        return ApiResponse::data(GroupJoinRequestResource::collection($items));
    }

    /**
     * @throws UnivaHttpException
     */
    public function store(
        Group                        $group,
        StoreGroupJoinRequestRequest $request,
        CreateGroupJoinRequest       $useCase,
    ): JsonResponse
    {
        $joinRequest = $useCase->handle($request->user(), $group, $request->validated());
        $joinRequest->load('user');

        return ApiResponse::created('Запит на вступ надіслано.', new GroupJoinRequestResource($joinRequest));
    }

    /**
     * @throws UnivaHttpException
     */
    public function update(
        Group                          $group,
        GroupJoinRequest               $joinRequest,
        RespondGroupJoinRequestRequest $request,
        GroupPermissionService         $permissions,
        RespondToGroupJoinRequest      $useCase,
    ): JsonResponse
    {
        $permissions->authorize($request->user(), $group, 'invite');
        if ($joinRequest->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }

        $joinRequest = $useCase->handle($request->user(), $joinRequest, $request->input('status'));

        return ApiResponse::ok('Запит на вступ оновлено.', new GroupJoinRequestResource($joinRequest));
    }
}
