<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;
use Illuminate\Validation\Rule;

class StoreGroupRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:64', Rule::unique('groups', 'code')],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('groups', 'slug')],
            'description' => ['nullable', 'string'],
            'avatar' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:32'],
            'visibility' => ['nullable', 'string', 'in:private,public'],
            'join_policy' => ['nullable', 'string', 'in:invite_only,invite_or_request,code_or_request'],
            'institution_name' => ['nullable', 'string', 'max:255'],
            'institution_short_name' => ['nullable', 'string', 'max:255'],
            'faculty_name' => ['nullable', 'string', 'max:255'],
            'department_name' => ['nullable', 'string', 'max:255'],
            'specialty_name' => ['nullable', 'string', 'max:255'],
            'course' => ['nullable', 'integer', 'min:1', 'max:10'],
            'study_year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'education_level' => ['nullable', 'string', 'max:64'],
            'study_form' => ['nullable', 'string', 'max:64'],
            'invite_role' => ['nullable', 'string', 'in:owner,moderator,headman,student'],
            'edit_role' => ['nullable', 'string', 'in:owner,moderator,headman,student'],
            'manage_subjects_role' => ['nullable', 'string', 'in:owner,moderator,headman,student'],
            'manage_schedule_role' => ['nullable', 'string', 'in:owner,moderator,headman,student'],
            'manage_deadlines_role' => ['nullable', 'string', 'in:owner,moderator,headman,student'],
            'manage_files_role' => ['nullable', 'string', 'in:owner,moderator,headman,student'],
            'post_announcements_role' => ['nullable', 'string', 'in:owner,moderator,headman,student'],
            'create_polls_role' => ['nullable', 'string', 'in:owner,moderator,headman,student'],
        ];
    }
}
