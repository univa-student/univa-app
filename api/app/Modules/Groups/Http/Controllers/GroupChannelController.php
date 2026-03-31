<?php

namespace App\Modules\Groups\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Groups\Http\Requests\StoreGroupChannelRequest;
use App\Modules\Groups\Http\Requests\StoreGroupMessageRequest;
use App\Modules\Groups\Http\Resources\GroupChannelResource;
use App\Modules\Groups\Http\Resources\GroupMessageResource;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupChannel;
use App\Modules\Groups\Models\GroupMessage;
use App\Modules\Groups\Services\GroupPermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GroupChannelController extends Controller
{
    public function index(Group $group, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);

        $channels = $group->channels()->with('subject')->orderBy('name')->get();

        return ApiResponse::data(GroupChannelResource::collection($channels));
    }

    public function store(
        Group $group,
        StoreGroupChannelRequest $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'edit');
        $data = $request->validated();

        $channel = $group->channels()->create([
            ...$data,
            'slug' => $data['slug'] ?? Str::slug($data['name']).'-'.Str::lower(Str::random(4)),
        ]);

        $channel->load('subject');

        return ApiResponse::created('Канал створено.', new GroupChannelResource($channel));
    }

    public function messages(
        Group $group,
        GroupChannel $channel,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->requireActiveMembership($request->user(), $group);
        if ($channel->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }

        $query = $channel->messages()->with(['user', 'file', 'attachmentLinks.file'])->latest();

        if ($request->boolean('only_files')) {
            $query->whereNotNull('file_id');
        }

        if ($request->boolean('only_important')) {
            $query->where('is_important', true);
        }

        if ($request->filled('q')) {
            $query->where('content', 'like', '%'.$request->string('q')->toString().'%');
        }

        $messages = $query->limit(100)->get()->reverse()->values();

        return ApiResponse::data(GroupMessageResource::collection($messages));
    }

    public function storeMessage(
        Group $group,
        GroupChannel $channel,
        StoreGroupMessageRequest $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->requireActiveMembership($request->user(), $group);
        if ($channel->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }

        $message = $channel->messages()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        $message->load(['user', 'file', 'attachmentLinks.file']);

        return ApiResponse::created('Повідомлення створено.', new GroupMessageResource($message));
    }

    public function destroyMessage(
        Group $group,
        GroupChannel $channel,
        GroupMessage $message,
        Request $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $membership = $permissions->requireActiveMembership($request->user(), $group);
        if ($channel->group_id !== $group->id || $message->group_channel_id !== $channel->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }

        $canDelete = $message->user_id === $membership->user_id || $permissions->can($request->user(), $group, 'edit');
        if (! $canDelete) {
            throw new UnivaHttpException('Доступ заборонено.', ResponseState::Forbidden);
        }

        $message->delete();

        return ApiResponse::ok('Повідомлення видалено.');
    }
}
