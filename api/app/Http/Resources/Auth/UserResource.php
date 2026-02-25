<?php

namespace App\Http\Resources\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // Персональні
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'middle_name' => $this->middle_name,
            'full_name' => $this->full_name,

            // Акаунт
            'username' => $this->username,
            'email' => $this->email,
            'phone' => $this->phone,

            // Аватар
            'avatar_url' => $this->avatar_path
                ? Storage::disk('public')->url($this->avatar_path)
                : null,

            // Навчання
            'university' => $this->university,
            'faculty' => $this->faculty,
            'specialty' => $this->specialty,
            'group' => $this->group,
            'course' => $this->course,

            // Налаштування
            'language' => $this->language,
            'timezone' => $this->timezone,

            // Додатково
            'referral_code' => $this->referral_code,

            // Згоди
            'agree_terms' => $this->agree_terms,
            'marketing_opt_in' => $this->marketing_opt_in,

            // Системні
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
        ];
    }
}
