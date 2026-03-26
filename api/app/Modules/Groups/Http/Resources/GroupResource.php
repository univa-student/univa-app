<?php

namespace App\Modules\Groups\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'slug' => $this->slug,
            'description' => $this->description,
            'avatar' => $this->avatar,
            'color' => $this->color,
            'visibility' => $this->visibility,
            'join_policy' => $this->join_policy,
            'is_active' => $this->is_active,
            'institution_name' => $this->institution_name,
            'institution_short_name' => $this->institution_short_name,
            'faculty_name' => $this->faculty_name,
            'department_name' => $this->department_name,
            'specialty_name' => $this->specialty_name,
            'course' => $this->course,
            'study_year' => $this->study_year,
            'education_level' => $this->education_level,
            'study_form' => $this->study_form,
            'invite_role' => $this->invite_role,
            'edit_role' => $this->edit_role,
            'manage_subjects_role' => $this->manage_subjects_role,
            'manage_schedule_role' => $this->manage_schedule_role,
            'manage_deadlines_role' => $this->manage_deadlines_role,
            'manage_files_role' => $this->manage_files_role,
            'post_announcements_role' => $this->post_announcements_role,
            'create_polls_role' => $this->create_polls_role,
            'owner' => GroupMemberUserResource::make($this->whenLoaded('owner')),
            'creator' => GroupMemberUserResource::make($this->whenLoaded('creator')),
            'members_count' => $this->whenCounted('members'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
