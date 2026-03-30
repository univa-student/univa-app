<?php

namespace App\Modules\Groups\Services;

use App\Modules\Files\Http\Resources\FileResource;
use App\Modules\Files\Models\File;
use App\Modules\Groups\Http\Resources\GroupAnnouncementResource;
use App\Modules\Groups\Http\Resources\GroupDeadlineResource;
use App\Modules\Groups\Http\Resources\GroupMessageResource;
use App\Modules\Groups\Models\Group;
use Carbon\Carbon;

class GroupOverviewService
{
    public function __construct(
        private readonly GroupScheduleService $scheduleService,
    ) {}

    public function build(Group $group): array
    {
        $from = Carbon::now()->startOfDay();
        $to = Carbon::now()->copy()->addDays(7)->endOfDay();

        $upcomingSchedule = array_slice(
            $this->scheduleService->buildForRange($group, $from, $to),
            0,
            5
        );

        $deadlines = $group->deadlines()
            ->with(['subject', 'memberStatuses'])
            ->where('due_at', '>=', now())
            ->orderBy('due_at')
            ->limit(5)
            ->get();

        $announcements = $group->announcements()
            ->with(['creator', 'acknowledgements', 'attachmentLinks.file'])
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $recentFiles = File::query()
            ->with(['user', 'groupSubject'])
            ->where('group_id', $group->id)
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get();

        $recentActivity = $group->channels()
            ->with(['messages.user', 'messages.file'])
            ->get()
            ->flatMap(fn ($channel) => $channel->messages)
            ->sortByDesc('created_at')
            ->take(8)
            ->values();

        return [
            'group' => $group->only(['id', 'name', 'code', 'slug', 'color']),
            'members_count' => $group->members()->where('status', 'active')->count(),
            'upcoming_schedule' => $upcomingSchedule,
            'upcoming_deadlines' => GroupDeadlineResource::collection($deadlines),
            'announcements' => GroupAnnouncementResource::collection($announcements),
            'recent_files' => FileResource::collection($recentFiles),
            'recent_activity' => GroupMessageResource::collection($recentActivity),
        ];
    }
}
