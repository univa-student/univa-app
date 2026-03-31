<?php

namespace App\Modules\Groups\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Groups\Http\Requests\StoreGroupPollRequest;
use App\Modules\Groups\Http\Requests\VoteGroupPollRequest;
use App\Modules\Groups\Http\Resources\GroupPollResource;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupPoll;
use App\Modules\Groups\Models\GroupPollOption;
use App\Modules\Groups\Models\GroupPollVote;
use App\Modules\Groups\Services\GroupPermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GroupPollController extends Controller
{
    public function index(Group $group, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);

        $items = $group->polls()->with(['creator', 'options.votes'])->latest()->get();

        return ApiResponse::data(GroupPollResource::collection($items));
    }

    public function store(
        Group $group,
        StoreGroupPollRequest $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $permissions->authorize($request->user(), $group, 'create_polls');
        $data = $request->validated();

        $poll = DB::transaction(function () use ($group, $request, $data) {
            $poll = $group->polls()->create([
                'created_by' => $request->user()->id,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'allows_multiple' => $data['allows_multiple'] ?? false,
                'is_anonymous' => $data['is_anonymous'] ?? false,
                'show_results' => $data['show_results'] ?? true,
                'status' => $data['status'] ?? 'open',
                'closes_at' => $data['closes_at'] ?? null,
            ]);

            foreach ($data['options'] as $index => $option) {
                $poll->options()->create([
                    'label' => $option['label'],
                    'position' => $option['position'] ?? $index,
                ]);
            }

            return $poll;
        });

        $poll->load(['creator', 'options.votes']);

        return ApiResponse::created('Опитування створено.', new GroupPollResource($poll));
    }

    public function show(Group $group, GroupPoll $poll, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->requireActiveMembership($request->user(), $group);
        if ($poll->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }
        $poll->load(['creator', 'options.votes']);

        return ApiResponse::data(new GroupPollResource($poll));
    }

    public function destroy(Group $group, GroupPoll $poll, Request $request, GroupPermissionService $permissions): JsonResponse
    {
        $permissions->authorize($request->user(), $group, 'create_polls');
        if ($poll->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }
        $poll->delete();

        return ApiResponse::ok('Опитування видалено.');
    }

    public function vote(
        Group $group,
        GroupPoll $poll,
        VoteGroupPollRequest $request,
        GroupPermissionService $permissions,
    ): JsonResponse {
        $membership = $permissions->requireActiveMembership($request->user(), $group);
        if ($poll->group_id !== $group->id) {
            throw new UnivaHttpException('Ресурс не знайдено.', ResponseState::NotFound);
        }

        $optionIds = collect($request->validated('option_ids'))
            ->map(fn ($item) => (int) $item)
            ->unique()
            ->values();

        $options = GroupPollOption::query()
            ->where('group_poll_id', $poll->id)
            ->whereIn('id', $optionIds)
            ->pluck('id');

        if ($options->count() !== $optionIds->count()) {
            throw new UnivaHttpException('Один або кілька вибраних варіантів не належать до цього опитування.', ResponseState::Unprocessable);
        }

        if (! $poll->allows_multiple && $optionIds->count() > 1) {
            throw new UnivaHttpException('У цьому опитуванні можна вибрати лише один варіант.', ResponseState::Unprocessable);
        }

        DB::transaction(function () use ($poll, $membership, $optionIds) {
            GroupPollVote::query()
                ->where('group_poll_id', $poll->id)
                ->where('user_id', $membership->user_id)
                ->delete();

            foreach ($optionIds as $optionId) {
                GroupPollVote::query()->create([
                    'group_poll_id' => $poll->id,
                    'group_poll_option_id' => $optionId,
                    'user_id' => $membership->user_id,
                ]);
            }
        });

        $poll->load(['creator', 'options.votes']);

        return ApiResponse::ok('Голос збережено.', new GroupPollResource($poll));
    }
}
