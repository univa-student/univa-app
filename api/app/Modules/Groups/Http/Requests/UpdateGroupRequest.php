<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;
use Illuminate\Validation\Rule;

class UpdateGroupRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $groupId = $this->route('group')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:64', Rule::unique('groups', 'code')->ignore($groupId)],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('groups', 'slug')->ignore($groupId)],
            'description' => ['sometimes', 'nullable', 'string'],
            'avatar' => ['sometimes', 'nullable', 'string', 'max:255'],
            'color' => ['sometimes', 'nullable', 'string', 'max:32'],
            'visibility' => ['sometimes', 'string', 'in:private,public'],
            'join_policy' => ['sometimes', 'string', 'in:invite_only,invite_or_request,code_or_request'],
            'is_active' => ['sometimes', 'boolean'],
            'institution_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'institution_short_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'faculty_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'department_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'specialty_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'course' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:10'],
            'study_year' => ['sometimes', 'nullable', 'integer', 'min:2000', 'max:2100'],
            'education_level' => ['sometimes', 'nullable', 'string', 'max:64'],
            'study_form' => ['sometimes', 'nullable', 'string', 'max:64'],
            'invite_role' => ['sometimes', 'string', 'in:owner,moderator,headman,student'],
            'edit_role' => ['sometimes', 'string', 'in:owner,moderator,headman,student'],
            'manage_subjects_role' => ['sometimes', 'string', 'in:owner,moderator,headman,student'],
            'manage_schedule_role' => ['sometimes', 'string', 'in:owner,moderator,headman,student'],
            'manage_deadlines_role' => ['sometimes', 'string', 'in:owner,moderator,headman,student'],
            'manage_files_role' => ['sometimes', 'string', 'in:owner,moderator,headman,student'],
            'post_announcements_role' => ['sometimes', 'string', 'in:owner,moderator,headman,student'],
            'create_polls_role' => ['sometimes', 'string', 'in:owner,moderator,headman,student'],
        ];
    }
}
